import React, { useState } from 'react';
import { getCurrentUserId, upsertUserNameToBackend, upsertTombstoneNameToBackend } from './supabaseService';
import './App.css'; // CSS 파일을 import합니다.

const OnboardingChat = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [tombstoneName, setTombstoneName] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleNextStep = async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;

    if (step === 0) {
      setUserName(inputValue);
      await upsertUserNameToBackend(inputValue, userId);
    } else if (step === 1) {
      setTombstoneName(inputValue);
      await upsertTombstoneNameToBackend(inputValue, userId);
      onOnboardingComplete();
    }

    setInputValue('');
    setStep(step + 1);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="onboarding-chat-container p-4 rounded-lg shadow-lg text-white">
      <div className="chat-box mb-4">
        {step === 0 && (
          <div className="chat-message">
            <div className="chat-bubble">안녕하세요? 선생님도 기후대응에 이의가 있으시군요! 이렇게 반가울 데가!</div>
            <div className="chat-bubble">저는 청끼입니다. 선생님 어떻게 불러드리면 될까요?</div>
          </div>
        )}
        {step === 1 && (
          <div className="chat-message">
            <div className="chat-bubble">{userName}님, 만나서 반갑습니다!</div>
            <div className="chat-bubble">선생님의 묘비명을 입력해주세요.</div>
          </div>
        )}
        {step === 2 && (
          <div className="chat-message">
            <div className="chat-bubble">감사합니다! 온보딩이 완료되었습니다.</div>
          </div>
        )}
      </div>
      {step < 2 && (
        <div className="input-box flex">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={step === 0 ? "이름 또는 별명(12자 이하)" : "묘비명 입력"}
            className="flex-grow p-2 rounded-l-lg text-black"
          />
          <button onClick={handleNextStep} className="p-2 rounded-r-lg">다음</button>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
