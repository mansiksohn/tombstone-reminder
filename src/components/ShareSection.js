import React from 'react';
import '../styles/share.scss';

function ShareSection({ link, buttonText, buttonColor }) {
  return (
    <div className="share-section mt-6">
      <a href={link} className={`${buttonColor} p-2 w-full text-center block `}>
        {buttonText}
      </a>
    </div>
  );
}

export default ShareSection;

