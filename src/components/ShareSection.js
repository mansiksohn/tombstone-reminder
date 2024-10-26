import React from 'react';

function ShareSection({ link, linkText = "공유할 페이지 열기" }) {
  return (
    <div className="share-section mt-6">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline" // 기본 하이퍼링크 스타일
      >
        {linkText}
      </a>
    </div>
  );
}

export default ShareSection;
