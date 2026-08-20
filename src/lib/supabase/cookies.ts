import type { CookieOptions } from '@supabase/ssr';

/**
 * @supabase/ssr의 setAll 콜백 인자 타입.
 * CookieMethodsServer가 유니온이라 TypeScript가 추론하지 못해 명시한다.
 */
export interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}
