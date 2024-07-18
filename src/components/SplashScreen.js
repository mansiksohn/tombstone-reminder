import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onNext }) => {
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNextButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash-screen">
      <img src="/assets/images/onboarding-mirror.jpg" alt="Onboarding Mirror" className="splash-image fade-in" />
      {showNextButton && (
        <button onClick={onNext} className="p-2 rounded-lg fade-in w-full">다음</button>
      )}
    </div>
  );
};

export default SplashScreen;
