import React, { useState } from 'react';

function UserNameSection({ userName, setUserName, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSaveClick = () => {
    handleSave('userName', userName);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave('userName', userName);
      setIsEditing(false);
    }
  };

  const displayedName = userName || '신원미상';

  return (
    <div className="text-center">
      {isEditing ? (
        <div className="flex items-center justify-center">
          <input
            type="text"
            value={userName}
            onChange={handleChange}
            onBlur={handleSaveClick}
            onKeyPress={handleKeyPress}
            className="border p-2 rounded-l text-black"
            autoFocus
          />
          <button onClick={handleSaveClick} className="bg-soul-green-500 text-white p-2 rounded-r">Save</button>
        </div>
      ) : (
        <h2 onClick={handleClick} className="text-xl font-bold cursor-pointer">
          <span className="block">
            <span className="text-soul-green-500 font-bold underline">{displayedName}</span>
            <span className="text-white">님</span>
            <span className="block">여기에 잠들다</span>
          </span>
        </h2>
      )}
    </div>
  );
}

export default UserNameSection;
