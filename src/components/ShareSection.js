import React from 'react';
import '../styles/share.scss';

function ShareSection({ handleCopyLink, buttonText, buttonColor }) {
  return (
    <div className="share-section mt-6">
      <button onClick={handleCopyLink} className={`${buttonColor} text-white p-2 rounded w-full`}>
        {buttonText}
      </button>
    </div>
  );
}

export default ShareSection;
