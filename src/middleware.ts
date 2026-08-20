import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieToSet } from '@/lib/supabase/cookies';

/**
 * 만료된 auth 토큰을 갱신하고 갱신된 쿠키를 요청·응답 양쪽에 반영한다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없으므로 이 일은 미들웨어만 할 수 있다.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );

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
