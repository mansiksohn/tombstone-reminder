-- 묘비log 초기 스키마
--
-- 구 프로젝트(2024-10 전시 데이터, 2025-04 일시정지)는 이관하지 않는다.
-- 실사용 15건 전원이 데모 데이터였고, 스키마가 새 제품 방향과 맞지 않는다.
-- 자세한 판단 근거는 docs/SUPABASE-RECOVERY.md 참조.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- slug 생성
-- ---------------------------------------------------------------------------
-- 공개 URL(/t/<slug>)에 auth user UUID를 노출하지 않기 위한 짧은 식별자.
-- 혼동하기 쉬운 문자(0/O, 1/l/I)를 뺀 32자 알파벳 x 10자 = 약 2^50.
create or replace function public.generate_slug()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := '23456789abcdefghjkmnpqrstuvwxyz';
  result   text := '';
  i        int;
begin
  for i in 1..10 loop
    result := result || substr(
      alphabet,
      1 + floor(random() * length(alphabet))::int,
      1
    );
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- tombs
-- ---------------------------------------------------------------------------
create table public.tombs (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  slug               text not null unique default public.generate_slug(),
  status             text not null default 'draft',

  user_name          text,
  tomb_name          text,              -- 추도문에서 골라 각인한 한 문장
  deathmask          text,
  birth_date         date,
  death_date         date,

  eulogy             text,              -- LLM 답변 전문
  eulogy_source      text,
  eulogy_captured_at timestamptz,

  onboarding_step    smallint not null default 0,
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint tombs_status_check
    check (status in ('draft', 'published')),
  constraint tombs_eulogy_source_check
    check (eulogy_source is null
           or eulogy_source in ('chatgpt', 'claude', 'gemini', 'other')),
  -- 게시하려면 각인된 한 문장이 반드시 있어야 한다. 빈 묘비는 게시될 수 없다.
  constraint tombs_published_needs_epitaph
    check (status <> 'published'
           or (tomb_name is not null and length(btrim(tomb_name)) > 0)),
  constraint tombs_tomb_name_length  check (length(tomb_name) <= 200),
  constraint tombs_eulogy_length     check (length(eulogy) <= 4000),
  constraint tombs_user_name_length  check (length(user_name) <= 24)
);

create index tombs_status_published_idx
  on public.tombs (published_at desc)
  where status = 'published';

comment on column public.tombs.tomb_name is
  '묘비에 각인된 한 문장. 개편 전에는 직접 입력, 개편 후에는 LLM 추도문에서 선택.';
comment on column public.tombs.onboarding_step is
  '0=시작 전, 1=이름, 2=생일, 3=데스마스크 완료. 3 이상이면 compose로 진행 가능.';

-- ---------------------------------------------------------------------------
-- flowers
-- ---------------------------------------------------------------------------
create table public.flowers (
  id           uuid primary key default gen_random_uuid(),
  tomb_id      uuid not null references public.tombs(user_id) on delete cascade,
  flower_type  text not null,
  visitor_hash text,               -- IP+UA 해시. 레이트리밋용이며 원문은 저장하지 않는다.
  created_at   timestamptz not null default now(),

  constraint flowers_type_check check (
    flower_type in ('Blossom', 'Bouquet', 'Hibiscus', 'Rose', 'Sunflower', 'Tulip')
  )
);

create index flowers_tomb_created_idx  on public.flowers (tomb_id, created_at desc);
create index flowers_ratelimit_idx     on public.flowers (visitor_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger tombs_touch_updated_at
  before update on public.tombs
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 가입 시 묘비 자동 생성
-- ---------------------------------------------------------------------------
-- 구 코드는 모든 upsert가 is_onboarded=true를 함께 써서, 이름만 입력해도
-- 온보딩 완료로 기록됐다(15건 전원이 is_onboarded=true, 그중 3건은 묘비명조차 없음).
-- 행 생성을 가입 시점으로 옮기고 진행도는 onboarding_step으로 따로 센다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.tombs (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- 구 프로젝트에는 `FOR SELECT USING (true)` 정책이 걸려 있어 anon 키만 있으면
-- 전원의 묘비명·부고·생년월일을 읽을 수 있었다. anon 키는 클라이언트 번들에
-- 들어가므로 사실상 전체 공개였다. 이번에는 게시된 것만 열어준다.

alter table public.tombs   enable row level security;
alter table public.flowers enable row level security;

create policy tombs_select_published_or_own on public.tombs
  for select
  to anon, authenticated
  using (status = 'published' or auth.uid() = user_id);

create policy tombs_insert_own on public.tombs
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy tombs_update_own on public.tombs
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy tombs_delete_own on public.tombs
  for delete to authenticated
  using (auth.uid() = user_id);

-- 헌화는 게시된 묘비의 것만 읽힌다.
create policy flowers_select_on_published on public.flowers
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.tombs t
      where t.user_id = flowers.tomb_id
        and t.status = 'published'
    )
  );

-- flowers INSERT 정책은 의도적으로 두지 않는다.
-- 삽입은 /api/flowers 서버 라우트에서 service_role로만 수행한다.
-- 익명 INSERT를 클라이언트에 열어주면 스팸을 막을 지점이 사라진다.
