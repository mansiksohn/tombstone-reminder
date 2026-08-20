import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * 계정 삭제.
 *
 * 구 코드는 브라우저에서 supabase.auth.admin.deleteUser()를 불렀다.
 * 그 API는 service_role 키를 요구하므로 호출은 언제나 실패했고,
 * 결과적으로 묘비 행만 지운 채 auth 계정은 남기고 로그아웃시켰다.
 * 삭제는 서버에서만 가능하다.
 *
 * tombs와 flowers는 auth.users에 대한 on delete cascade로 함께 사라진다.
 */
export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('계정 삭제 실패:', error.message);
    return NextResponse.json(
      { error: '계정을 삭제하지 못했습니다.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
