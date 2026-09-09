import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Google OAuth가 돌려준 코드를 세션으로 교환한다.
 *
 * 기본 도착지가 /new인 이유: 로그인은 오직 만들기 화면의 게시 버튼에서만
 * 시작된다. 초안은 sessionStorage에 있고 /new가 그것을 꺼내 이어서
 * 게시하므로, 여기서 /me로 보내면 초안이 영영 살아나지 못한다.
 *
 * next 파라미터는 받아주되 우리가 보내지는 않는다. OAuth 요청의
 * redirect_to에 쿼리스트링이 붙으면 Supabase 허용목록 매칭이 까다로워져
 * 400을 맞기 쉽기 때문이다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/new';

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
