import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { requireEnv } from '@/lib/env';

/**
 * RLS를 우회하는 service_role 클라이언트.
 *
 * 헌화 삽입(flowers는 INSERT 정책이 없어 이 경로로만 쓸 수 있다)과
 * 계정 삭제에만 쓴다. 절대 클라이언트 번들에 들어가면 안 되므로
 * 서버 라우트에서만 import할 것.
 */
export function createAdminClient() {
  const key = requireEnv(
    'SUPABASE_SERVICE_ROLE_KEY',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
