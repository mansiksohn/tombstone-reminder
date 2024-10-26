import React, { useState } from 'react';

function ShareSection({ createShareLink }) {
  const [buttonText, setButtonText] = useState('Copy Link to Clipboard');
  const [buttonColor, setButtonColor] = useState('bg-soul-green-500');
  const [link, setLink] = useState('');

  const handleCopyLink = async () => {
    try {
      const generatedLink = await createShareLink();
      setLink(generatedLink);
      await navigator.clipboard.writeText(generatedLink);
      setButtonText('Link Copied');
      setButtonColor('bg-soul-green-900');

      // 일정 시간 후 텍스트와 색상 원래대로 복원
      setTimeout(() => {
        setButtonText('Copy Link to Clipboard');
        setButtonColor('bg-soul-green-500');
      }, 1000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <div className="share-section mt-6">
      <a
        href={link}
        onClick={handleCopyLink}
        className={`${buttonColor} text-white p-2 rounded w-full text-center block`}
      >
        {buttonText}
      </a>
    </div>
  );
}

export default ShareSection;
