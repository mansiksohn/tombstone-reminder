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
              {showBubble1 && <div className="chat-bubble fade-in">아직 살아계시군요?<br />뭐, 준비는 빠를수록 좋죠.</div>}
              {showBubble2 && <div className="chat-bubble fade-in">성함이 어떻게 되십니까? 묘비에 새겨드릴게요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="이름 또는 별명(12자 이하)"
                    className="flex-grow p-2 rounded-l-lg text-black w-full"
                  />
                  <div className="onboarding-char-count">{inputValue.length}/12</div>
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg w-14">다음</button>
                </div>
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
              {showBubble1 && <div className="chat-bubble">{userName}님이시군요. 반갑습니다!</div>}
              {showBubble2 && <div className="chat-bubble">묘비명 각인은 무료로 해드립니다. 선생님 인생을 한 문장으로 남겨보세요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex w-full">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="묘비명 입력 (72자 이하)"
                    className="flex-grow p-2 rounded-l-lg text-black w-full"
                  />
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg w-14">다음</button>
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
              {showBubble2 && <div className="chat-bubble">요기 밑에 남겨주시면 같이 써드릴게요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <div className="input-box flex w-full">
                  <input
                    type="date"
                    value={inputValue}
                    onChange={handleDateChange}
                    placeholder="YYYY-MM-DD"
                    className="flex-grow p-2 rounded-l-lg text-black w-full"
                  />
                  <button onClick={handleNextStep} className="p-2 rounded-r-lg w-14">다음</button>
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
              {showBubble1 && <div className="chat-bubble">마지막으로, 묻어두고 싶은 것을 하나 골라보세요.</div>}
              {showBubble2 && <div className="chat-bubble">뭐라도 채워놔야 하거든요.</div>}
            </div>
            <div className="grow"></div>
            {showInput && (
              <>
                <DeathMaskSection selectedImage={selectedImage} onSelect={handleNextStep} images={images} />
                <div className="input-box flex w-full">
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
                <div className="chat-bubble">감사합니다!<br />이제 다 만들었습니다.</div>
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
