import React from 'react';

function ShareSection({ handleCopyLink, buttonText, buttonColor }) {
  return (
    <div className="share-section mt-6">
      <button onClick={handleCopyLink} className={`${buttonColor} text-white p-2 rounded`}>
        {buttonText}
      </button>
    </div>
  );
}

export default ShareSection;
