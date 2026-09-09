/**
 * 환경변수를 검사하되, 없으면 무엇이 없는지 분명히 말하고 죽는다.
 *
 * 이게 없으면 Supabase 클라이언트가 undefined URL을 받아 알 수 없는
 * 에러로 터진다. 미들웨어는 모든 요청에서 돌기 때문에 랜딩 페이지까지
 * 통째로 500이 되고, 배포 로그만 보고는 원인을 찾을 수 없다.
 *
 * 값을 인자로 받는 이유: Next는 `process.env.NEXT_PUBLIC_X`를 리터럴로
 * 만났을 때만 빌드 타임에 치환한다. `process.env[name]`처럼 동적 키로
 * 읽으면 치환되지 않아 브라우저에서 undefined가 된다. 그래서 이름이
 * 아니라 값을 넘긴다.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name}가 설정되지 않았습니다. ` +
        'Vercel 프로젝트 설정(Production·Preview·Development 모두)과 ' +
        '로컬 .env.local을 확인하세요.',
    );
  }
  return value;
}

/**
 * Supabase를 쓸 수 있는 상태인가.
 *
 * DB 없이도 의미가 있는 화면(랜딩, /new의 붙여넣기 단계)이 설정 하나
 * 때문에 통째로 죽지 않도록, 그런 곳에서만 미리 확인하는 용도다.
 * 정말로 데이터가 있어야 하는 화면은 확인하지 말고 그대로 실패시켜서
 * requireEnv가 무엇이 없는지 말하게 두는 편이 낫다.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * 이 배포가 자기 자신을 가리키는 절대 URL.
 *
 * 공유 링크와 OG 태그에 쓰이므로 틀리면 눈에 바로 띈다 — 예전에는
 * NEXT_PUBLIC_SITE_URL이 없으면 localhost로 떨어져서, Vercel에 올린
 * 뒤 공유 링크가 http://localhost:3000/t/... 로 나왔다.
 *
 * Vercel이 자동으로 주입하는 시스템 환경변수를 쓴다:
 * - VERCEL_PROJECT_PRODUCTION_URL: 프로덕션 도메인 (안정적)
 * - VERCEL_URL: 이 배포 고유의 URL (프리뷰마다 다름)
 *
 * 프로덕션에서는 안정적인 도메인을, 프리뷰에서는 그 프리뷰 자신을
 * 가리켜야 링크를 눌렀을 때 지금 보고 있는 것과 같은 곳으로 간다.
 * 서버에서만 호출된다 (NEXT_PUBLIC_ 접두사가 없는 변수를 읽는다).
 */
export function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelHost =
    process.env.VERCEL_ENV === 'production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;

  if (vercelHost) return `https://${vercelHost.replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
