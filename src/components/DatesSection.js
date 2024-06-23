import React, { useState } from 'react';

function DatesSection({ birthDate, deathDate, setBirthDate, setDeathDate, handleSave }) {
  const [isEditingBirth, setIsEditingBirth] = useState(false);
  const [isEditingDeath, setIsEditingDeath] = useState(false);

  const handleBirthClick = () => {
    setIsEditingBirth(true);
  };

  const handleDeathClick = () => {
    setIsEditingDeath(true);
  };

  const handleBirthChange = (e) => {
    setBirthDate(e.target.value);
  };

  const handleDeathChange = (e) => {
    setDeathDate(e.target.value);
  };

  const handleBirthSave = () => {
    handleSave('birthDate', birthDate);
    setIsEditingBirth(false);
  };

  const handleDeathSave = () => {
    handleSave('deathDate', deathDate);
    setIsEditingDeath(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isEditingBirth) {
        handleBirthSave();
      } else if (isEditingDeath) {
        handleDeathSave();
      }
    }
  };

  return (
    <div className="date-container">
      {isEditingBirth ? (
        <input
          type="date"
          value={birthDate}
          onChange={handleBirthChange}
          onBlur={handleBirthSave}
          onKeyPress={handleKeyPress}
          className="border p-2 rounded-l text-black"
          autoFocus
        />
      ) : (
        <span onClick={handleBirthClick} className="date-input cursor-pointer">{birthDate || '생년월일 입력'}</span>
      )}
      {' - '}
      {isEditingDeath ? (
        <input
          type="date"
          value={deathDate}
          onChange={handleDeathChange}
          onBlur={handleDeathSave}
          onKeyPress={handleKeyPress}
          className="border p-2 rounded-l text-black"
          autoFocus
        />
      ) : (
        <span onClick={handleDeathClick} className="date-input cursor-pointer">{deathDate || '사망일 입력'}</span>
      )}
    </div>
  );
}

export default DatesSection;
