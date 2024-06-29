import React, { useState, useEffect } from 'react';

const tags = [
  '최고의',
  '못이룬',
  '영원한',
  '불굴의',
  '끝없는',
  '인생의',
  '불타는',
  '진정한',
  '영원의',
  '불멸의',
  '생명의',
];

function GoatSection({ goat, setGoat, newGoat, setNewGoat, handleSave, handleEditGoat, handleDeleteGoat }) {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showInputField, setShowInputField] = useState(false); // 입력 필드 표시 상태 추가

  useEffect(() => {
    if (!newGoat.tag) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      setNewGoat((prev) => ({ ...prev, tag: randomTag }));
    }
  }, [newGoat, setNewGoat]);

  const handleNewGoatChange = (e) => {
    const { name, value } = e.target;
    setNewGoat((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveGoat = () => {
    handleSave('goat', newGoat);
    setShowInputField(false); // 저장 후 입력 필드 숨기기
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setNewGoat(goat[index]);
  };

  const handleEditSave = () => {
    handleEditGoat(editingIndex, newGoat);
    setEditingIndex(-1);
  };

  const handleDelete = () => {
    handleDeleteGoat(editingIndex);
    setEditingIndex(-1);
  };

  const isSaveDisabled = newGoat.description.length === 0;

  return (
    <div className="goat-section">
      <h3 className="goat-title text-center text-xl font-bold">GOAT</h3>
      <span className="goat-subtitle">(당신 최고의 순간)</span>
      {goat.map((item, index) => (
        <div key={index} className="goat-item">
          {editingIndex === index ? (
            <div className="goat-input mt-4">
              <select
                name="tag"
                value={newGoat.tag || ''}
                onChange={handleNewGoatChange}
                className="border p-2 rounded text-black mb-2 w-full"
              >
                {tags.map((tag, idx) => (
                  <option key={idx} value={tag}>{tag}</option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                value={newGoat.description}
                onChange={handleNewGoatChange}
                placeholder="설명 (16자 이내)"
                className={`border p-2 rounded text-black mb-2 w-full ${isSaveDisabled ? 'denied' : ''}`}
                maxLength={16}
              />
              <input
                type="text"
                name="link"
                value={newGoat.link}
                onChange={handleNewGoatChange}
                placeholder="링크"
                className="border p-2 rounded text-black mb-2 w-full"
              />
              <button onClick={handleEditSave} className="bg-soul-green-500 text-white p-2 rounded w-full mb-2" disabled={isSaveDisabled}>
                Update
              </button>
              <button onClick={() => setEditingIndex(-1)} className="bg-red-500 text-white p-2 rounded w-full mb-2">Cancel</button>
              <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded w-full">Delete</button>
            </div>
          ) : (
            <div className="flex items-center" onClick={() => handleEditClick(index)}>
              <span className="tag">{item.tag}</span>
              <span className="description">{item.description}</span>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-soul-green-500">
                  <img src={process.env.PUBLIC_URL + '/assets/images/link-45deg.svg'} alt="Link Icon" className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      ))}
      {goat.length < 3 && editingIndex === -1 && (
        <div className="goat-input mt-4">
          {showInputField ? (
            <>
              <select
                name="tag"
                value={newGoat.tag || ''}
                onChange={handleNewGoatChange}
                className="border p-2 rounded text-black mb-2 w-full"
              >
                {tags.map((tag, index) => (
                  <option key={index} value={tag}>{tag}</option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                value={newGoat.description}
                onChange={handleNewGoatChange}
                placeholder="설명 (16자 이내)"
                className={`border p-2 rounded text-black mb-2 w-full ${isSaveDisabled ? 'denied' : ''}`}
                maxLength={16}
              />
              <input
                type="text"
                name="link"
                value={newGoat.link}
                onChange={handleNewGoatChange}
                placeholder="링크"
                className="border p-2 rounded text-black mb-2 w-full"
              />
              <button onClick={handleSaveGoat} className="bg-soul-green-500 text-white p-2 rounded w-full" disabled={isSaveDisabled}>
                Save
              </button>
            </>
          ) : (
            <div className="flex justify-center items-center h-12" onClick={() => setShowInputField(true)}>
              <span className="text-soul-green-500 text-2xl">+</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GoatSection;
