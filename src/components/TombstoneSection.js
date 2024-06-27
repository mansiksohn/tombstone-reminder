import React, { useState } from 'react';

function TombstoneSection({ tombstoneName, setTombstoneName, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    if (e.target.value.length <= 160) {
      setTombstoneName(e.target.value);
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

  const placeholderText = 'Δεν ελπίζω τίποταΔε φοβούμαι τίποταΕίμαι λέφτερος';

  return (
    <div className="tombstone-container mt-6 relative">
      <img 
        src={tombstoneName ? process.env.PUBLIC_URL + '../assets/images/headstone.svg' : process.env.PUBLIC_URL + '../assets/images/headstone-placeholder.svg'} 
        alt="Tombstone" 
        className="tombstone-image" 
      />
      <div className="tombstone-name-overlay">
        {isEditing ? (
          <div className="flex items-center justify-center">
            <input
              type="text"
              value={tombstoneName}
              onChange={handleChange}
              onBlur={handleSaveClick}
              onKeyPress={handleKeyPress}
              className="border p-2 rounded-l text-black"
              autoFocus
              maxLength={160} // 입력 필드에 대한 길이 제한 설정
            />
            <button onClick={handleSaveClick} className="bg-soul-green-500 text-white p-2 rounded-r">Save</button>
          </div>
        ) : (
          <h2 
            onClick={handleClick} 
            className={`text-2xl tombstone-name ${!tombstoneName ? 'placeholder-text' : ''}`}
          >
            {tombstoneName || <span className="text-grey-222">{placeholderText}</span>}
          </h2>
        )}
      </div>
    </div>
  );
}

export default TombstoneSection;
