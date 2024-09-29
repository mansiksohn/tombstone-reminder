import React, { useEffect, useState } from 'react';
import DeathMaskSection from './DeathMaskSection';

const ChatStep = ({
  step,
  userName,
  inputValue,
  handleInputChange,
  handleDateChange,
  handleNextStep,
  handleLogout,
  selectedImage,
  images
}) => {
  const [showBubble1, setShowBubble1] = useState(false);
  const [showBubble2, setShowBubble2] = useState(false);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setShowBubble1(false);
    setShowBubble2(false);
    setShowInput(false);

    const bubbleTimers = [];

    bubbleTimers.push(setTimeout(() => {
      setShowBubble1(true);
    }, 500));

    bubbleTimers.push(setTimeout(() => {
      setShowBubble2(true);
    }, 1500));

    bubbleTimers.push(setTimeout(() => {
      setShowInput(true);
    }, 2500));

    return () => {
      bubbleTimers.forEach(timer => clearTimeout(timer));
    };
  }, [step]);

  const handleFinish = () => {
    // 여기에서 홈 화면으로 리디렉션하거나 온보딩 완료 후 수행할 작업을 추가
    window.location.href = '/'; // 홈 화면으로 리디렉션
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <div className="chat-message">
              {showBubble1 && <div className="chat-bubble fade-in">안녕하세요?</div>}
              {showBubble2 && <div className="chat-bubble fade-in">뭐라고 불러드릴까요? 묘비에 적어드릴게요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="이름 또는 별명(12자 이하)"
                    className="flex-grow p-2 rounded-l-lg text-black"
                  />
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg">다음</button>
                </div>
                <div className="onboarding-char-count">{inputValue.length}/12</div>
                <div className="logout-link">
                  <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
              </>
            )}
          </>
        );
      case 1:
        return (
          <>
            <div className="chat-message">
              {showBubble1 && <div className="chat-bubble">{userName}님, 반가워요. 묘비명 각인도 무료로 해드릴게요.</div>}
              {showBubble2 && <div className="chat-bubble">선생님의 인생을 한 문장으로 표현한다면?</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="묘비명 입력 (72자 이하)"
                    className="flex-grow p-2 rounded-l-lg text-black"
                  />
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg">다음</button>
                </div>
                <div className="onboarding-char-count">{inputValue.length}/72</div>
                <div className="logout-link">
                  <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
              </>
            )}
          </>
        );
      case 2:
        return (
          <>
            <div className="chat-message">
              {showBubble1 && <div className="chat-bubble">생일을 기억하시나요?</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex">
                  <input
                    type="date"
                    value={inputValue}
                    onChange={handleDateChange}
                    placeholder="YYYY-MM-DD"
                    className="flex-grow p-2 rounded-l-lg text-black"
                  />
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg">다음</button>
                </div>
                <div className="logout-link">
                  <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
              </>
            )}
          </>
        );
      case 3:
        return (
          <>
            <div className="chat-message">
              {showBubble1 && <div className="chat-bubble">대신 묻어둘 것을 골라주세요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <DeathMaskSection selectedImage={selectedImage} onSelect={handleNextStep} images={images} />
                <div className="input-box flex">
                  <button onClick={handleNextStep} className="p-2 rounded-lg w-full">다음</button>
                </div>
                <div className="logout-link">
                  <button onClick={handleLogout} className="logout-button">로그아웃</button>
                </div>
              </>
            )}
          </>
        );
        case 4:
          return (
            <>
              <div className="chat-message">
                <div className="chat-bubble">감사합니다! 이제 다 만들었습니다.</div>
              </div>
              <div className="grow"></div>
              <div className="bottom-button-container">
                <button onClick={handleFinish} className="p-2 rounded-lg w-full">묘비 보러가기</button>
              </div>
            </>
          );        
      default:
        return null;
    }
  };

  return (
    <div className="chat-box flex-1">
      {renderStepContent()}
    </div>
  );
};

export default ChatStep;
