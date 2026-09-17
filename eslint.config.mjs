// eslint-config-next 16부터 네이티브 flat config 배열을 직접 내보낸다.
// FlatCompat.extends()는 legacy shareable config용이라 더는 맞지 않는다.
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  { ignores: ['.next/**', 'build/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
