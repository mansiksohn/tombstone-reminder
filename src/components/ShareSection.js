import React from 'react';

<<<<<<< HEAD
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
=======
function ShareSection({ link, buttonText, buttonColor }) {
  return (
    <div className="share-section mt-6">
      <a href={link} className={`${buttonColor} text-white p-2 rounded w-full text-center block`}>
        {buttonText}
>>>>>>> testView
      </a>
    </div>
  );
}

export default ShareSection;
