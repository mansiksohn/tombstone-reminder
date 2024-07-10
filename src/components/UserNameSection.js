import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/username.scss';

function UserNameSection({ userName, setUserName, handleSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    if (e.target.value.length <= 12) {
      setUserName(e.target.value);
    }
  };

  const handleSaveClick = useCallback(() => {
    handleSave('userName', userName);
    setIsEditing(false);
  }, [handleSave, userName]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave('userName', userName);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        handleSaveClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSaveClick]);

  const displayedName = userName || '신원미상';

  return (
    <div className="username-container text-center">
      {isEditing ? (
        <div className="flex items-center justify-center relative">
          <input
            ref={inputRef}
            type="text"
            value={userName}
            onChange={handleChange}
            onBlur={handleSaveClick}
            onKeyPress={handleKeyPress}
            className="username-input"
            autoFocus
            maxLength={12} // 입력 필드에 대한 길이 제한 설정
            placeholder="이름 12자 이하" // placeholder 설정
          />
          <span className="name-char-count">{userName.length}/12</span>
        </div>
      ) : (
        <h2 onClick={handleClick} className="text-xl cursor-pointer">
          <span className="block">
            <span className="text-soul-green-500 font-bold underline">{displayedName}</span>
            <span className="text-white">님</span>
            <span className="block pt-1">여기에 잠들다</span>
          </span>
        </h2>
      )}
    </div>
  );
}

export default UserNameSection;
