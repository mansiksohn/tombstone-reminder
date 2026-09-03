'use client';

import dynamic from 'next/dynamic';

/**
 * Rive는 canvas/WASM을 쓰므로 서버에서 렌더할 수 없고, 라이브러리도
 * 가볍지 않다. 랜딩은 처음 온 사람이 가장 먼저 만나는 화면이므로
 * 애니메이션 때문에 첫 로딩이 느려지면 안 된다. 나중에 따로 받는다.
 */
const RiveAnimation = dynamic(() => import('./RiveAnimation'), {
  ssr: false,
  loading: () => <div className="splash-animation" />,
});

export default function LandingAnimation() {
  return <RiveAnimation />;
}
