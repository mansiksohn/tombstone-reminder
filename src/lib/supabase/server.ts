import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/database.types';
import type { CookieToSet } from './cookies';
import { requireEnv } from '@/lib/env';

/**
 * 요청 스코프의 Supabase 클라이언트. RLS가 그대로 적용된다.
 * 서버 컴포넌트에서는 쿠키를 쓸 수 없으므로 set이 던지는 예외를 삼킨다
 * (세션 갱신은 미들웨어가 담당한다).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출된 경우. 미들웨어가 갱신하므로 무시해도 된다.
          }
        },
      },
    },
  );
}
