// src/Onboarding.js
import React, { useState } from 'react';
import { getCurrentUserId, upsertUserNameToBackend, upsertTombstoneNameToBackend } from './supabaseService';

const Onboarding = ({ onOnboardingComplete }) => {
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');

  const handleOnboarding = async () => {
    const userId = await getCurrentUserId();
    if (userId) {
      await upsertUserNameToBackend(userName, userId);
      await upsertTombstoneNameToBackend(tombstoneName, userId);
      onOnboardingComplete();
    }
  };

  return (
    <div className="onboarding-container bg-white p-6">
      <h2 className="text-xl font-bold mb-4">Welcome to Tombstone Reminder</h2>
      <div className="input-section mb-4">
        <input 
          type="text" 
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border p-2 rounded w-full text-black mb-2"
        />
        <input 
          type="text" 
          placeholder="Enter your tombstone name"
          value={tombstoneName}
          onChange={(e) => setTombstoneName(e.target.value)}
          className="border p-2 rounded w-full text-black"
        />
      </div>
      <button onClick={handleOnboarding} className="bg-blue-500 text-white p-2 rounded">
        Complete Onboarding
      </button>
    </div>
  );
};

export default Onboarding;
