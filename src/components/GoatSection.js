import React, { useState, useEffect, useRef, useCallback } from 'react';

const tags = [
  '◼◼◼',
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
  const [showInputField, setShowInputField] = useState(false);
  const editFieldRef = useRef(null);

  useEffect(() => {
    if (!newGoat.tag) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      setNewGoat((prev) => ({ ...prev, tag: randomTag }));
    }
  }, [newGoat, setNewGoat]);

  const handleEditSave = useCallback(() => {
    if (editingIndex !== -1) {
      handleEditGoat(editingIndex, newGoat);
      setEditingIndex(-1);
    }
  }, [editingIndex, handleEditGoat, newGoat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editFieldRef.current && !editFieldRef.current.contains(event.target)) {
        if (editingIndex !== -1) {
          handleEditSave();
        } else {
          setShowInputField(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingIndex, handleEditSave]);

  const handleNewGoatChange = (e) => {
    const { name, value } = e.target;
    setNewGoat((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveGoat = () => {
    handleSave('goat', newGoat);
    setShowInputField(false);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setNewGoat(goat[index]);
  };

  const handleDelete = () => {
    handleDeleteGoat(editingIndex);
    setEditingIndex(-1);
  };

  const isSaveDisabled = newGoat.description.length === 0;

  const formatLink = (link) => {
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return 'http://' + link;
    }
    return link;
  };

  const getIconSrc = (link) => {
    if (link.includes('instagram.com')) {
      return '/assets/images/instagram.svg';
    } else if (link.includes('twitter.com') || link.includes('x.com')) {
      return '/assets/images/twitter.svg';
    } else if (link.includes('youtube.com')) {
      return '/assets/images/youtube.svg';
    }
    return '/assets/images/link-45deg.svg';
  };

  return (
    <div className="goat-section">
      <h3 className="goat-title text-center text-xl font-bold">GOAT</h3>
      <span className="goat-subtitle">:: 최고의 순간 ::</span>
      {goat.map((item, index) => (
        <div key={index} className="goat-item">
          {editingIndex === index ? (
            <div className="goat-input" ref={editFieldRef}>
              <select
                name="tag"
                value={newGoat.tag || ''}
                onChange={handleNewGoatChange}
                className="rounded mb-2"
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
              <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded w-full">Delete</button>
            </div>
          ) : (
            <div className="flex items-center" onClick={() => handleEditClick(index)}>
              <span className="tag">{item.tag}</span>
              <span className="description">{item.description}</span>
              {item.link && (
                <a href={formatLink(item.link)} target="_blank" rel="noopener noreferrer" className="text-soul-green-500">
                  <img src={process.env.PUBLIC_URL + getIconSrc(item.link)} alt="Link Icon" className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      ))}
      {goat.length < 3 && editingIndex === -1 && (
        <div className="goat-input" ref={editFieldRef}>
          {showInputField ? (
            <>
              <select
                name="tag"
                value={newGoat.tag || ''}
                onChange={handleNewGoatChange}
                className="rounded mb-2"
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
            <div className="placeholder flex justify-center items-center h-12" onClick={() => setShowInputField(true)}>
              <span className="text-soul-green-500 text-2xl">+</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GoatSection;
