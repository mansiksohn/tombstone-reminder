'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Rive는 canvas/WASM을 쓰므로 서버에서 렌더할 수 없다.
const RiveAnimation = dynamic(() => import('./RiveAnimation'), {
  ssr: false,
  loading: () => <div className="splash-animation" />,
});

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash-screen">
      <RiveAnimation />
      {showButton && (
        <button onClick={onNext} className="p-2 rounded-lg splash-animation w-full">
          묘비 만들기
        </button>
      )}
    </div>
  );
}
