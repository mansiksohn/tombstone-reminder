import React from 'react';

function ShareSection({ link, buttonText, buttonColor }) {
  return (
    <div className="share-section mt-6">
      <a
        href={link}
        target="_blank" // 새 탭에서 열리도록 설정 (필요에 따라 제거 가능)
        rel="noopener noreferrer" // 보안 강화
        className={`${buttonColor} text-white p-2 rounded w-full text-center block`}
      >
        {buttonText}
      </a>
    </div>
  );
}

export default ShareSection;
