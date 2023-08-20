import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';

import './App.css';

import Login from './Login';
import LogoutButton from './LogoutButton';


const saveTombstoneNameToBackend = async (name, userId) => {
  try {
    const response = await fetch('http://localhost:5000/save-tombstone-name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, userId })
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

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? user.id : null;
}

function App() {
  const [localUser, setLocalUser] = useState(null);
  const [tombstoneName, setTombstoneName] = useState('Your Name');
  const [inputName, setInputName] = useState('');

  // 인증 상태 변화 감지
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange((event, session) => {
      setLocalUser(session ? session.user : null);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 해제
    return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
        }
    };
}, []);

  const handleSave = async () => {
    const userId = await getCurrentUserId();
    const result = await saveTombstoneNameToBackend(inputName, userId);
    
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

  if (!localUser) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        Tombstone Reminder
        <LogoutButton />
        </header>
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
    </div>
  );
}

export default App;