import React, { useEffect, useState } from 'react';
import { useRive } from '@rive-app/react-canvas';

const SplashScreen = ({ onNext }) => {
  const [showNextButton, setShowNextButton] = useState(false);

  // useRive 훅을 사용하여 Rive 애니메이션 로드 및 설정
  const { RiveComponent } = useRive({
    src: '/assets/animations/incense_stick.riv',
    autoplay: true, // 애니메이션을 자동으로 재생
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNextButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash-screen">
      <RiveComponent className="splash-animation w-full" />
      {showNextButton && (
        <button onClick={onNext} className="p-2 rounded-lg splash-animation w-full">시작하기</button>
      )}
    </div>
  );
};

export default SplashScreen;
