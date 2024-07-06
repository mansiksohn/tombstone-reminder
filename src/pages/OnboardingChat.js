import React, { useState } from 'react';
import { getCurrentUserId, upsertUserNameToBackend, upsertTombstoneNameToBackend } from '../utils/supabaseService';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import

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
    <div className="onboarding-chat-container flex flex-col p-4 rounded-lg shadow-lg text-white">
      <div className="chat-box flex-1">
        {step === 0 && (
          <div className="chat-message">
            <div className="chat-bubble">안녕하세요?</div>
            <div className="chat-bubble">비석에 새길 이름은 뭐로 하실래요? 별명도 좋아요.</div>
          </div>
        )}
        {step === 1 && (
          <div className="chat-message">
            <div className="chat-bubble">{userName}님, 제가 특별히 묘비명을 직접 고를 수 있는 기회를 드릴게요</div>
            <div className="chat-bubble">선생님의 인생을 한 문장으로 표현한다면?</div>
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
