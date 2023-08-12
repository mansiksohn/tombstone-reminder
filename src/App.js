import React, { useState } from 'react';
import './App.css';

import LoginForm from './LoginForm';

const saveTombstoneNameToBackend = async (name) => {
  try {
    const response = await fetch('http://localhost:5000/save-tombstone-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error saving name:", data.error);
    } else {
      console.log("Name saved successfully:", data);
    }

    return data; // 데이터를 반환합니다.
  } catch (error) {
    console.error("There was an error calling the backend:", error);
    return { error: "There was an error calling the backend." }; // 오류를 반환합니다.
  }
};

function App() {
  const [user, setUser] = useState(null);

  const handleUserLogin = (user) => {
    setUser(user);
  };

  const [tombstoneName, setTombstoneName] = useState('Your Name');
  const [inputName, setInputName] = useState('');

  const handleSave = async () => {
    const result = await saveTombstoneNameToBackend(inputName);
    
    if (result) {
      if (result.error) {
        console.error('Error saving name:', result.error);
      } else {
        setTombstoneName(inputName);
        setInputName('');
      }
    } else {
      console.error('Unexpected error: No response from saveTombstoneNameToBackend');
    }
  };

  return (
    <div className="app-container">
      {user ? (
        <>
          <header className="app-header">Tombstone Reminder</header>
          <main className="app-main">
            <div className="tombstone-container">
              <img src={process.env.PUBLIC_URL + '/headstone.png'} alt="Tombstone" className="tombstone-image" />
              <div className="tombstone-name-overlay">
                <h2>{tombstoneName}</h2>
              </div>
            </div>
            <div className="input-section">
              <input 
                type="text" 
                placeholder="Enter your tombstone name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <button onClick={handleSave}>Save</button>
            </div>
          </main>
        </>
      ) : (
        <div>
          <LoginForm onLogin={handleUserLogin} />
        </div>
      )}
    </div>
  );
}

export default App;