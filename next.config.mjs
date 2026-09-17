/**
 * NEXT_PUBLIC_* 는 브라우저 번들에 빌드 시점 값이 구워진다.
 *
 * 서버는 런타임에도 process.env를 읽을 수 있어서, 빌드 때 값이 없어도
 * 페이지는 멀쩡히 렌더된다. 반면 브라우저 번들에는 undefined가 박혀
 * 로그인 버튼을 누르는 순간에야 터진다 — 배포는 초록불인데 사용자만
 * 깨지는 조합이라 원인을 찾기 어렵다.
 *
 * Vercel은 환경변수를 바꿔도 기존 배포에 소급 적용하지 않으므로,
 * 값을 넣은 뒤에는 반드시 재배포해야 한다. 그 실수를 조용히 통과시키지
 * 않도록 빌드를 세운다.
 *
 * 로컬에서는 경고만 한다. 자격증명 없이 컴파일만 확인하는 경우가 있고,
 * 그때 빌드를 막을 이유는 없다. 함정은 배포 쪽에만 있다.
 */
const REQUIRED_PUBLIC_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = REQUIRED_PUBLIC_ENV.filter((name) => !process.env[name]);

if (missing.length > 0) {
  const message =
    `[env] 브라우저 번들에 들어가야 할 환경변수가 빌드 시점에 없습니다: ${missing.join(', ')}.\n` +
    '      이대로 빌드하면 페이지는 뜨지만 로그인 등 클라이언트 동작이 깨집니다.\n' +
    '      Vercel: Settings → Environment Variables에서 해당 환경(Preview 포함)에\n' +
    '      값을 넣은 뒤 반드시 재배포하세요 (기존 배포에는 소급 적용되지 않습니다).';

  if (process.env.VERCEL) {
    throw new Error(message);
  }
  console.warn(message);
}

/**
 * 개발 모드는 HMR/React Refresh가 인라인 eval을 쓰므로 CSP를 걸지 않는다.
 * 프로덕션 빌드에만 적용해 로컬 개발 흐름을 깨지 않는다.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: ${supabaseUrl}`,
      "font-src 'self' data:",
      `connect-src 'self' ${supabaseUrl}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
