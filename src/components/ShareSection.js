import React, { useState } from 'react';
import '../styles/share.scss';

function ShareSection({ handleCopyLink, buttonText, buttonColor }) {
  // `isPressed` 상태 생성
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="share-section mt-6">
      <button
        type="button"
        onClick={handleCopyLink}
        onTouchStart={() => setIsPressed(true)} // 터치 시작 시 `isPressed` 설정
        onTouchEnd={() => setIsPressed(false)} // 터치 종료 시 `isPressed` 해제
        onMouseDown={() => setIsPressed(true)} // 마우스로 눌렀을 때도 적용
        onMouseUp={() => setIsPressed(false)} // 마우스에서 손을 뗄 때 해제
        className={`${buttonColor} text-white p-2 rounded w-full ${isPressed ? 'pressed' : ''}`}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default ShareSection;
