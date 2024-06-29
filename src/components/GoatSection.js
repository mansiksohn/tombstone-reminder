import React, { useState } from 'react';

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

function GoatSection({ userId, goat, setGoat, newGoat, setNewGoat, handleSave, handleDeleteGoat }) {
  const [isEditing, setIsEditing] = useState(-1);

  const handleNewGoatChange = (e) => {
    const { name, value } = e.target;
    setNewGoat((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoatSave = async () => {
    try {
      if (isEditing === -1) {
        await handleSave('goat', [...goat, newGoat]);
      } else {
        const updatedGoat = goat.map((item, index) => (index === isEditing ? newGoat : item));
        await handleSave('goat', updatedGoat);
      }
      setIsEditing(-1);
      setNewGoat({ description: '', link: '' });
    } catch (error) {
      console.error('Error saving GOAT:', error);
    }
  };

  const handleEditClick = (index) => {
    setIsEditing(index);
    setNewGoat(goat[index]);
  };

  const handleDeleteClick = async (index) => {
    try {
      await handleDeleteGoat(index);
    } catch (error) {
      console.error('Error deleting GOAT:', error);
    }
  };

  return (
    <div className="goat-section">
      <h3 className="goat-title text-center text-xl font-bold">GOAT</h3>
      <span className="goat-subtitle">(당신 최고의 순간)</span>
      {goat && goat.map((item, index) => (
        <div key={index} className="goat-item">
          <div className="flex items-center">
            <span className="tag">{item.tag}</span>
            <span className="description">{item.description}</span>
            <button onClick={() => handleEditClick(index)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
            <button onClick={() => handleDeleteClick(index)} className="bg-red-500 text-white p-2 rounded">Delete</button>
          </div>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-soul-green-500">
              <img src={process.env.PUBLIC_URL + '/assets/images/link-45deg.svg'} alt="Link Icon" className="w-5 h-5" />
            </a>
          )}
        </div>
      ))}
      {goat && goat.length < 3 && (
        <div className="goat-input mt-4">
          <select
            name="tag"
            value={newGoat.tag || ''}
            onChange={handleNewGoatChange}
            className="border p-2 rounded text-black mb-2 w-full"
          >
            <option value="">태그 선택</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag}>{tag}</option>
            ))}
          </select>
          <input
            type="text"
            name="description"
            value={newGoat.description}
            onChange={handleNewGoatChange}
            placeholder="설명"
            className="border p-2 rounded text-black mb-2 w-full"
          />
          <input
            type="text"
            name="link"
            value={newGoat.link}
            onChange={handleNewGoatChange}
            placeholder="링크"
            className="border p-2 rounded text-black mb-2 w-full"
          />
          <button onClick={handleGoatSave} className="bg-soul-green-500 text-white p-2 rounded w-full">Save</button>
        </div>
      )}
    </div>
  );
}

export default GoatSection;
