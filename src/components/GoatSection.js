import React from 'react';

function GoatSection({ goat, setGoat, newGoat, setNewGoat, handleSave, handleEditGoat, handleDeleteGoat }) {
  const handleNewGoatChange = (e) => {
    const { name, value } = e.target;
    setNewGoat((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoatSave = () => {
    handleSave('goat', newGoat);
  };

  return (
    <div className="goat-section">
      <div className="goat-container">
        <h3 className="text-xl font-bold">GOAT</h3>
        <span className="block pt-2">(Greatest of All Time)</span>
        {goat.map((item, index) => (
          <div key={index} className="goat-item mb-4">
            <p className="font-bold">{item.description}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-soul-green-500">{item.link}</a>
            <div className="flex justify-center mt-2">
              <button onClick={() => handleEditGoat(index)} className="bg-yellow-500 text-white p-2 rounded mr-2">Edit</button>
              <button onClick={() => handleDeleteGoat(index)} className="bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        ))}
        {goat.length < 3 && (
          <div className="goat-input mt-4">
            <input
              type="text"
              name="description"
              value={newGoat.description}
              onChange={handleNewGoatChange}
              placeholder="설명"
              className="border p-2 rounded text-black mb-2"
            />
            <input
              type="text"
              name="link"
              value={newGoat.link}
              onChange={handleNewGoatChange}
              placeholder="링크"
              className="border p-2 rounded text-black mb-2"
            />
            <button onClick={handleGoatSave} className="bg-soul-green-500 text-white p-2 rounded">Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoatSection;
