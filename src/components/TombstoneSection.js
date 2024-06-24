import React, { useState } from 'react';

function TombstoneSection({ tombstoneName, setTombstoneName, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setTombstoneName(e.target.value);
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

  return (
    <div className="tombstone-container mt-6 relative">
      <img src={process.env.PUBLIC_URL + '../assets/images/headstone.svg'} alt="Tombstone" className="tombstone-image" />
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
            />
            <button onClick={handleSaveClick} className="bg-green-500 text-white p-2 rounded-r">Save</button>
          </div>
        ) : (
          <h2 onClick={handleClick} className="text-2xl font-semibold cursor-pointer">
            {tombstoneName}
          </h2>
        )}
      </div>
    </div>
  );
}

export default TombstoneSection;
