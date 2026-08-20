import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Google OAuth가 돌려준 코드를 세션으로 교환한다. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/me';

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('세션 교환 실패:', error.message);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  // 프록시 뒤에서는 origin이 내부 호스트일 수 있으므로 전달 헤더를 우선한다.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const base =
    process.env.NODE_ENV === 'development' || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  return NextResponse.redirect(`${base}${next}`);
}
