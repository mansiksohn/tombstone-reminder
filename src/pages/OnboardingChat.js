import React, { useState, useEffect } from 'react';
import { getCurrentUserId, upsertUserNameToBackend, upsertTombstoneNameToBackend, upsertBirthDate } from '../utils/supabaseService';
import supabase from '../utils/supabaseClient';
import { signOut } from '../utils/authService';
import images from '../data/images'; // 공통 이미지 배열을 임포트
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import SplashScreen from '../components/SplashScreen';
import Header from '../components/OnboardingHeader';
import ChatStep from '../components/ChatStep';

const OnboardingChat = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(-1); // 스플래시 스크린을 위해 -1로 초기화
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedImage, setSelectedImage] = useState('/assets/images/deathmask/Place Skull.png');
  const [inputValue, setInputValue] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const handleNextStep = async (image) => {
    if (step === -1) {
      setStep(0);
      return;
    }

    if (!userId) return;

    if (step === 0) {
      setUserName(inputValue);
      await upsertUserNameToBackend(inputValue, userId);
    } else if (step === 1) {
      setTombstoneName(inputValue);
      await upsertTombstoneNameToBackend(inputValue, userId);
    } else if (step === 2) {
      setBirthDate(inputValue);
      await upsertBirthDate(inputValue, userId);
    } else if (step === 3) {
      setSelectedImage(image ? image.path : null);
      if (image) {
        await supabase
          .from('Tombs')
          .update({ deathmask: image.name })
          .eq('user_id', userId);
      }
    } else if (step === 4) {
      onOnboardingComplete();
    }

    setInputValue('');
    setStep(step + 1);
  };

  const handleInputChange = (e) => {
    if (step === 0 && e.target.value.length <= 12) {
      setInputValue(e.target.value);
    } else if (step === 1 && e.target.value.length <= 72) {
      setInputValue(e.target.value);
    }
  };

  const handleDateChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="onboarding-chat-container flex flex-col p-4 rounded-lg text-white">
      {step === -1 && <SplashScreen onNext={handleNextStep} />}
      {step > -1 && <Header />}
      {step > -1 && (
        <ChatStep
          step={step}
          userName={userName}
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleDateChange={handleDateChange}
          handleNextStep={handleNextStep}
          handleLogout={handleLogout}
          selectedImage={selectedImage}
          images={images}
        />
      )}
    </div>
  );
};

export default OnboardingChat;
