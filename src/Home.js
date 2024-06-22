import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import LogoutButton from './LogoutButton';
import OnboardingChat from './OnboardingChat';
import {
  getCurrentUserId,
  fetchUserName,
  fetchTombstoneName,
  fetchIsOnboarded,
  upsertTombstoneNameToBackend,
  createShareLink,
  upsertUserNameToBackend,
  fetchObituary,
  upsertObituary,
  fetchGoat,
  upsertGoat,
} from './supabaseService';
import supabase from './supabaseClient';

function Home() {
  const [localUser, setLocalUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('Your Name');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTombstone, setIsEditingTombstone] = useState(false);
  const [buttonText, setButtonText] = useState('Copy Link to Clipboard');
  const [buttonColor, setButtonColor] = useState('bg-green-500');
  const [obituary, setObituary] = useState('');
  const [goat, setGoat] = useState([]);
  const [newGoat, setNewGoat] = useState({ description: '', link: '' });
  const [editingGoatIndex, setEditingGoatIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setLocalUser(session ? session.user : null);
    });
    const subscription = data?.subscription;
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        const is_onboarded = await fetchIsOnboarded(userId);
        setIsOnboarded(is_onboarded);
        if (is_onboarded) {
          const user_name = await fetchUserName(userId);
          const tombstone_name = await fetchTombstoneName(userId);
          const fetchedObituary = await fetchObituary(userId);
          const fetchedGoat = await fetchGoat(userId);
          if (user_name) {
            setUserName(user_name);
          }
          if (tombstone_name) {
            setTombstoneName(tombstone_name);
          }
          setObituary(fetchedObituary);
          setGoat(fetchedGoat);
        }
      }
    };
    if (localUser) {
      loadUserData();
    }
  }, [localUser]);

  const handleCopyLink = async () => {
    try {
      const userId = await getCurrentUserId();
      const link = await createShareLink(userId);
      await navigator.clipboard.writeText(link);
      setButtonText('Link Copied');
      setButtonColor('bg-blue-500');
      setTimeout(() => {
        setButtonText('Copy Link to Clipboard');
        setButtonColor('bg-green-500');
      }, 1000);
    } catch (error) {
      console.error('Error creating or copying link:', error);
    }
  };

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleTombstoneClick = () => {
    setIsEditingTombstone(true);
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleTombstoneChange = (e) => {
    setTombstoneName(e.target.value);
  };

  const handleNameSave = async () => {
    if (!userName.trim()) {
      return; // 빈 값은 입력되지 않도록 예외 처리
    }
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User is not logged in');
      }
      await upsertUserNameToBackend(userName, userId);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating user name:', error);
    }
  };

  const handleTombstoneSave = async () => {
    if (!tombstoneName.trim()) {
      return; // 빈 값은 입력되지 않도록 예외 처리
    }
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User is not logged in');
      }
      await upsertTombstoneNameToBackend(tombstoneName, userId);
      setIsEditingTombstone(false);
    } catch (error) {
      console.error('Error updating tombstone name:', error);
    }
  };

  const handleObituaryChange = (e) => {
    setObituary(e.target.value);
  };

  const handleObituarySave = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User is not logged in');
      }
      await upsertObituary(obituary, userId);
    } catch (error) {
      console.error('Error saving obituary:', error);
    }
  };

  const handleNewGoatChange = (e) => {
    const { name, value } = e.target;
    setNewGoat((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoatSave = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User is not logged in');
      }
      let updatedGoat;
      if (editingGoatIndex === -1) {
        updatedGoat = [...goat, newGoat];
      } else {
        updatedGoat = goat.map((item, index) => index === editingGoatIndex ? newGoat : item);
        setEditingGoatIndex(-1);
      }
      await upsertGoat(updatedGoat, userId);
      setGoat(updatedGoat);
      setNewGoat({ description: '', link: '' });
    } catch (error) {
      console.error('Error saving goat:', error);
    }
  };

  const handleEditGoat = (index) => {
    setNewGoat(goat[index]);
    setEditingGoatIndex(index);
  };

  const handleDeleteGoat = async (index) => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('User is not logged in');
      }
      const updatedGoat = goat.filter((_, i) => i !== index);
      await upsertGoat(updatedGoat, userId);
      setGoat(updatedGoat);
    } catch (error) {
      console.error('Error deleting goat:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isEditingName) {
        handleNameSave();
      } else if (isEditingTombstone) {
        handleTombstoneSave();
      } else {
        handleGoatSave();
      }
    }
  };

  const handleOnboardingComplete = async () => {
    setIsOnboarded(true);
    const userId = await getCurrentUserId();
    const user_name = await fetchUserName(userId);
    const tombstone_name = await fetchTombstoneName(userId);
    const fetchedObituary = await fetchObituary(userId);
    const fetchedGoat = await fetchGoat(userId);
    if (user_name) {
      setUserName(user_name);
    }
    if (tombstone_name) {
      setTombstoneName(tombstone_name);
    }
    setObituary(fetchedObituary);
    setGoat(fetchedGoat);
  };

  if (!localUser) {
    return <Login />;
  }

  if (!isOnboarded) {
    return <OnboardingChat onOnboardingComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="container">
      <header className="header">
        묘꾸
        <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
          ☰
        </button>
      </header>
      {menuOpen && (
        <div className="menu">
          <button onClick={() => setMenuOpen(false)} className="menu-close-button">✖</button>
          <div className="menu-content">
            <button>계정 설정</button>
            <button>문의사항</button>
            <LogoutButton />
          </div>
        </div>
      )}
      <main className="main">
        <div className="text-center">
          {isEditingName ? (
            <div className="flex items-center justify-center">
              <input
                type="text"
                value={userName}
                onChange={handleNameChange}
                onBlur={handleNameSave}
                onKeyPress={handleKeyPress}
                className="border p-2 rounded-l text-black"
                autoFocus
              />
              <button onClick={handleNameSave} className="bg-green-500 text-white p-2 rounded-r">Save</button>
            </div>
          ) : (
            <h2 onClick={handleNameClick} className="text-xl font-semibold cursor-pointer">
              {userName ? `${userName}님의 묘비` : '이름을 입력하세요'}
            </h2>
          )}
        </div>
        <div className="tombstone-container mt-6">
          <img src={process.env.PUBLIC_URL + '/headstone.png'} alt="Tombstone" className="tombstone-image" />
          <div className="tombstone-name-overlay">
            {isEditingTombstone ? (
              <div className="flex items-center justify-center">
                <input
                  type="text"
                  value={tombstoneName}
                  onChange={handleTombstoneChange}
                  onBlur={handleTombstoneSave}
                  onKeyPress={handleKeyPress}
                  className="border p-2 rounded-l text-black"
                  autoFocus
                />
                <button onClick={handleTombstoneSave} className="bg-green-500 text-white p-2 rounded-r">Save</button>
              </div>
            ) : (
              <h2 onClick={handleTombstoneClick} className="text-2xl font-semibold cursor-pointer">
                {tombstoneName}
              </h2>
            )}
          </div>
        </div>
        <div className="obituary-section">
          <h3 className="text-xl font-bold">부고</h3>
          <textarea
            value={obituary}
            onChange={handleObituaryChange}
            onBlur={handleObituarySave}
            className="border p-2 rounded text-black"
            rows="4"
            placeholder="부고를 작성하세요"
          />
        </div>
        <div className="goat-section">
          <h3 className="text-xl font-bold">GOAT (Greatest of All Time)</h3>
          {goat.map((item, index) => (
            <div key={index} className="goat-item mb-4">
              <p className="font-semibold">{item.description}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">{item.link}</a>
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
                placeholder="GOAT 설명"
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
              <button onClick={handleGoatSave} className="bg-green-500 text-white p-2 rounded">Save GOAT</button>
            </div>
          )}
        </div>
        <div className="share-section mt-6">
          <button onClick={handleCopyLink} className={`${buttonColor} text-white p-2 rounded`}>
            {buttonText}
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
