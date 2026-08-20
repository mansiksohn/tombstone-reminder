'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Database, TombRow } from '@/lib/database.types';

type TombUpdate = Database['public']['Tables']['tombs']['Update'];

type EditableField =
  | 'user_name'
  | 'tomb_name'
  | 'deathmask'
  | 'birth_date'
  | 'death_date';

const LIMITS: Partial<Record<EditableField, number>> = {
  user_name: 24,
  tomb_name: 200,
};

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * 묘비의 단일 필드를 저장한다.
 *
 * 구 코드는 저장 경로가 두 갈래였다 — useUserData의 handleSave와,
 * ObituarySection·DeathMaskSection이 직접 부르는 supabase.update().
 * 그래서 화면 상태와 DB가 어긋났다. 이제 쓰기는 전부 여기를 지난다.
 */
export async function saveField(
  field: EditableField,
  value: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '로그인이 필요합니다.' };

  const limit = LIMITS[field];
  if (limit && value && value.length > limit) {
    return { ok: false, error: `${limit}자를 넘을 수 없습니다.` };
  }

  // 계산된 키로 객체를 만들면 인덱스 시그니처가 넓어져 Update 타입과 어긋난다.
  // 빈 객체에 대입하는 편이 컬럼 타입 검사를 그대로 받는다.
  const patch: TombUpdate = {};
  patch[field] = value || null;

  const { error } = await supabase
    .from('tombs')
    .update(patch)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/me');
  return { ok: true };
}

/** 온보딩 진행도를 앞으로만 옮긴다. 뒤로 가도 진행도가 깎이지 않는다. */
export async function advanceOnboarding(step: number): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '로그인이 필요합니다.' };

  const { data: current } = await supabase
    .from('tombs')
    .select('onboarding_step')
    .eq('user_id', user.id)
    .maybeSingle();

  const next = Math.max(current?.onboarding_step ?? 0, step);

  const { error } = await supabase
    .from('tombs')
    .update({ onboarding_step: next })
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * 게시 / 비공개 전환.
 *
 * 각인 없는 묘비의 게시는 DB 체크 제약이 막지만, 사용자에게 제약 위반
 * 메시지를 그대로 보여줄 수는 없으므로 여기서 먼저 걸러 문구를 만든다.
 */
export async function setPublished(publish: boolean): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: '로그인이 필요합니다.' };

  if (publish) {
    const { data: tomb } = await supabase
      .from('tombs')
      .select('tomb_name')
      .eq('user_id', user.id)
      .maybeSingle<Pick<TombRow, 'tomb_name'>>();

    if (!tomb?.tomb_name?.trim()) {
      return { ok: false, error: '묘비에 새길 문장을 먼저 정해주세요.' };
    }
  }

  const { error } = await supabase
    .from('tombs')
    .update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/me');
  return { ok: true };
}
