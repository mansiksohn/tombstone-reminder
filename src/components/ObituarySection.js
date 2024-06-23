import React from 'react';

function ObituarySection({ obituary, setObituary, handleSave }) {
  const handleChange = (e) => {
    setObituary(e.target.value);
  };

  const handleBlur = () => {
    handleSave('obituary', obituary);
  };

  return (
    <div className="obituary-section">
      <h3 className="text-xl font-bold">부고</h3>
      <textarea
        value={obituary || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        className="border p-2 rounded text-black"
        rows="4"
        placeholder="부고를 작성하세요"
      />
    </div>
  );
}

export default ObituarySection;
