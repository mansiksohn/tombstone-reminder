import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieToSet } from '@/lib/supabase/cookies';

/**
 * 만료된 auth 토큰을 갱신하고 갱신된 쿠키를 요청·응답 양쪽에 반영한다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없으므로 이 일은 미들웨어만 할 수 있다.
 *
 * 설정이 없으면 죽지 않고 통과시킨다. 이 미들웨어는 거의 모든 경로에
 * 걸리기 때문에, 여기서 예외를 던지면 인증이 전혀 필요 없는 랜딩
 * 페이지까지 통째로 500이 된다 (MIDDLEWARE_INVOCATION_FAILED).
 * 미들웨어의 유일한 임무는 세션 갱신이고 Supabase가 없으면 갱신할
 * 세션도 없으므로, 크게 로그를 남기고 지나가는 편이 맞다.
 * 실제로 인증이 필요한 페이지는 각자 분명한 에러로 실패한다.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      '[middleware] Supabase 환경변수가 없어 세션 갱신을 건너뜁니다. ' +
        `없는 값: ${[
          !url && 'NEXT_PUBLIC_SUPABASE_URL',
          !anonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        ]
          .filter(Boolean)
          .join(', ')}. ` +
        'NEXT_PUBLIC_* 는 빌드 시점에 번들에 구워지므로, Vercel에서는 ' +
        '해당 환경(Production·Preview·Development)에 값을 넣은 뒤 ' +
        '반드시 재배포해야 반영됩니다.',
    );
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser()를 호출해야 세션 갱신이 일어난다. 제거하지 말 것.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // 정적 자산과 이미지 파일을 제외한 모든 경로
    '/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|riv)$).*)',
  ],
};
