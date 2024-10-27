import React from 'react';
import '../styles/share.scss';

function ShareSection({ link, buttonText, buttonColor }) {
  console.log('Received link in ShareSection:', link); // ShareSection에서 link 확인
  return (
    <div className="share-section mt-6">
      <a href={link} className={`${buttonColor} text-white p-2 rounded w-full text-center block`}>
        {buttonText}
      </a>
    </div>
  );
}

export default ShareSection;
