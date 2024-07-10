import React, { useState } from 'react';

function TombstoneSection({ tombstoneName, setTombstoneName, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const MAX_NEW_LINES = 5;

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    let value = e.target.value;
    // 연속된 공백을 하나로 줄이고, 앞뒤 공백을 제거
    value = value.replace(/\s\s+/g, ' ').trim();
    // 줄바꿈 수를 제한
    const newLineCount = (value.match(/\n/g) || []).length;
    if (newLineCount <= MAX_NEW_LINES && value.length <= 80) {
      setTombstoneName(value);
    }
  };

  const handleSaveClick = () => {
    handleSave('tombstoneName', tombstoneName);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave('tombstoneName', tombstoneName);
      setIsEditing(false);
    }
  };

  const formatText = (text) => {
    return { __html: text.replace(/\n/g, '<br>') };
  };

  const placeholderText = 'Δεν ελπίζω τίποταΔε φοβούμαι τίποταΕίμαι λέφτερος';

  return (
    <div className="tombstone-container relative">
      <img 
        src={tombstoneName ? `${process.env.PUBLIC_URL}/assets/images/headstone.svg` : `${process.env.PUBLIC_URL}/assets/images/headstone-placeholder.svg`} 
        alt="Tombstone" 
        className="tombstone-image" 
      />
      <div className="tombstone-name-overlay">
        {isEditing ? (
          <div className="flex items-center justify-center">
            <textarea
              value={tombstoneName}
              onChange={handleChange}
              onBlur={handleSaveClick}
              onKeyPress={handleKeyPress}
              className="textarea border p-2 rounded-l text-black"
              autoFocus
              maxLength={80} // 입력 필드에 대한 길이 제한 설정
            />
          </div>
        ) : (
          <h2 
            onClick={handleClick} 
            className={`text-2xl tombstone-name ${!tombstoneName ? 'placeholder-text' : 'filled-text'}`}
            dangerouslySetInnerHTML={formatText(tombstoneName || placeholderText)}
          />
        )}
      </div>
    </div>
  );
}

export default TombstoneSection;
