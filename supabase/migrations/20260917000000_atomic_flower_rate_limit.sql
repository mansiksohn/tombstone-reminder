-- ---------------------------------------------------------------------------
-- 헌화 레이트리밋을 원자적으로 처리한다.
--
-- 기존 API 라우트는 "카운트 조회 -> 삽입"을 두 번의 별도 쿼리로 수행했다.
-- 동시에 여러 요청이 들어오면 모두 같은 카운트를 보고 통과할 수 있어
-- 분당 한도가 실질적으로 뚫릴 수 있었다. 같은 visitor_hash에 대해
-- 트랜잭션 단위 advisory lock으로 직렬화해 이 경쟁 조건을 막는다.
-- ---------------------------------------------------------------------------
create or replace function public.insert_flower_rate_limited(
  p_tomb_id uuid,
  p_flower_type text,
  p_visitor_hash text,
  p_rate_limit int,
  p_window_seconds int
)
returns table (inserted boolean, flower_id uuid, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count  int;
  v_oldest timestamptz;
  v_since  timestamptz := now() - (p_window_seconds || ' seconds')::interval;
  v_id     uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_visitor_hash, 0));

  select count(*), min(created_at) into v_count, v_oldest
  from public.flowers
  where visitor_hash = p_visitor_hash
    and created_at >= v_since;

  if v_count >= p_rate_limit then
    return query select
      false,
      null::uuid,
      greatest(
        1,
        ceil(extract(epoch from (v_oldest + (p_window_seconds || ' seconds')::interval - now())))::int
      );
    return;
  end if;

  insert into public.flowers (tomb_id, flower_type, visitor_hash)
  values (p_tomb_id, p_flower_type, p_visitor_hash)
  returning id into v_id;

  return query select true, v_id, 0;
end;
$$;

revoke all on function public.insert_flower_rate_limited from public, anon, authenticated;
grant execute on function public.insert_flower_rate_limited to service_role;
