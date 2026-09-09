import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { FlowerRow, TombRow } from '@/lib/database.types';
import { isSupabaseConfigured, resolveSiteUrl } from '@/lib/env';

/**
 * 로그인 여부만 필요한 곳을 위한 가벼운 확인.
 * 설정이 없으면 비로그인으로 답한다 (랜딩은 DB 없이도 떠야 한다).
 */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}

/**
 * 현재 로그인 사용자의 묘비를 한 번의 쿼리로 가져온다.
 *
 * 구 코드는 컬럼마다 fetch 함수를 따로 두어 같은 행에 7번 왕복했고,
 * 온보딩 완료 처리에서 6번을 더 순차로 돌았다.
 */
export async function getMyTomb(): Promise<{
  userId: string;
  tomb: TombRow;
} | null> {
  // 설정이 없으면 비로그인과 똑같이 다룬다. /new의 붙여넣기 단계는
  // DB 없이도 굴러가야 하고, /me는 이 null을 받아 랜딩으로 보낸다.
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('tombs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('묘비를 불러오지 못했습니다:', error.message);
    return null;
  }
  // 가입 트리거가 행을 만들어주지만, 트리거 이전에 가입한 계정이 있을 수 있다.
  if (!data) return null;

  return { userId: user.id, tomb: data };
}

/** 공개된 묘비를 slug로 조회. 초안은 RLS가 걸러내므로 여기서 못 읽는다. */
export async function getPublishedTomb(slug: string): Promise<TombRow | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('tombs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  return data ?? null;
}

/** 구 `/share/{user_id}` 링크를 새 slug로 잇기 위한 조회. */
export async function getSlugByUserId(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('tombs')
    .select('slug')
    .eq('user_id', userId)
    .eq('status', 'published')
    .maybeSingle();

  return data?.slug ?? null;
}

export interface FlowerSummary {
  total: number;
  recent: Pick<FlowerRow, 'id' | 'flower_type'>[];
}

/** 땅 위에 그릴 최근 헌화. 무한히 쌓이면 화면이 무너지므로 상한을 둔다. */
export const MAX_RENDERED_FLOWERS = 60;

export async function getFlowers(tombId: string): Promise<FlowerSummary> {
  const supabase = await createClient();

  const [{ data }, { count }] = await Promise.all([
    supabase
      .from('flowers')
      .select('id, flower_type')
      .eq('tomb_id', tombId)
      .order('created_at', { ascending: false })
      .limit(MAX_RENDERED_FLOWERS),
    supabase
      .from('flowers')
      .select('*', { count: 'exact', head: true })
      .eq('tomb_id', tombId),
  ]);

  return { total: count ?? 0, recent: data ?? [] };
}

export function siteUrl() {
  return resolveSiteUrl();
}

export function shareUrl(slug: string) {
  return `${siteUrl()}/t/${slug}`;
}
