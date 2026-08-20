'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { advanceOnboarding, saveField } from '@/lib/actions';
import { createClient } from '@/lib/supabase/client';
import { deathMasks, PLACEHOLDER_MASK } from '@/lib/images';
import SplashScreen from './SplashScreen';

/**
 * 3단계로 줄인 온보딩: 이름 → 생일 → 데스마스크.
 *
 * 구 온보딩의 2단계(묘비명 직접 입력)는 사라졌다. 묘비명은 이제
 * /me/compose에서 LLM 추도문 중 한 문장을 골라 각인한다.
 */
const STEP_SPLASH = -1;
const STEP_NAME = 0;
const STEP_BIRTH = 1;
const STEP_MASK = 2;
const STEP_DONE = 3;

const NAME_LIMIT = 12;

export default function OnboardingChat({
  initialName,
}: {
  initialName: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(STEP_SPLASH);
  const [name, setName] = useState(initialName ?? '');
  const [input, setInput] = useState('');
  const [mask, setMask] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.href = '/';
  };

  const next = async () => {
    if (busy) return;
    setBusy(true);

    try {
      if (step === STEP_NAME) {
        const value = input.trim();
        if (!value) return;
        await saveField('user_name', value);
        await advanceOnboarding(1);
        setName(value);
      } else if (step === STEP_BIRTH) {
        await saveField('birth_date', input || null);
        await advanceOnboarding(2);
      } else if (step === STEP_MASK) {
        if (mask) await saveField('deathmask', mask);
        await advanceOnboarding(3);
      }

      setInput('');
      setStep((s) => s + 1);
    } finally {
      setBusy(false);
    }
  };

  if (step === STEP_SPLASH) {
    return (
      <div className="onboarding-chat-container flex flex-col p-4 rounded-lg text-white">
        <SplashScreen onNext={() => setStep(STEP_NAME)} />
      </div>
    );
  }

  return (
    <div className="onboarding-chat-container flex flex-col p-4 rounded-lg text-white">
      <div className="onboarding-header m-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/login-Headstone.svg"
          alt=""
          className="header-image"
        />
      </div>

      <div className="chat-box flex-1">
        {step === STEP_NAME && (
          <Step
            bubbles={[
              '아직 살아계시군요?\n뭐, 준비는 빠를수록 좋죠.',
              '성함이 어떻게 되십니까? 묘비에 새겨드릴게요.',
            ]}
            onLogout={signOut}
          >
            <div className="input-box flex w-full">
              <input
                type="text"
                value={input}
                onChange={(e) =>
                  e.target.value.length <= NAME_LIMIT &&
                  setInput(e.target.value)
                }
                placeholder={`이름 또는 별명(${NAME_LIMIT}자 이하)`}
                className="flex-grow p-2 rounded-l-lg text-black w-full"
              />
              <div className="onboarding-char-count">
                {input.length}/{NAME_LIMIT}
              </div>
              <button onClick={next} disabled={busy} className="p-2 rounded-r-lg w-14">
                다음
              </button>
            </div>
          </Step>
        )}

        {step === STEP_BIRTH && (
          <Step
            bubbles={[
              `${name}님이시군요. 반갑습니다!`,
              '생일을 기억하시나요? 요기 밑에 남겨주시면 같이 써드릴게요.',
            ]}
            onLogout={signOut}
          >
            <div className="input-box flex w-full">
              <input
                type="date"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow p-2 rounded-l-lg text-black w-full"
              />
              <button onClick={next} disabled={busy} className="p-2 rounded-r-lg w-14">
                다음
              </button>
            </div>
          </Step>
        )}

        {step === STEP_MASK && (
          <Step
            bubbles={[
              '마지막으로, 묻어두고 싶은 것을 하나 골라보세요.',
              '뭐라도 채워놔야 하거든요.',
            ]}
            onLogout={signOut}
          >
            <div className="death-mask-section p-4">
              <div className="coffin p-4 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    deathMasks.find((m) => m.name === mask)?.path ??
                    PLACEHOLDER_MASK
                  }
                  alt="고른 것"
                  className="selected-image"
                />
              </div>
              <div className="grid grid-cols-7 gap-2 mx-auto mt-4">
                {deathMasks.map((m) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={m.name}
                    src={m.path}
                    alt={m.name}
                    onClick={() => setMask(m.name)}
                    className={`option-image cursor-pointer ${
                      mask === m.name ? 'option-image-selected' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="input-box flex w-full">
              <button onClick={next} disabled={busy} className="p-2 rounded-lg w-full">
                다음
              </button>
            </div>
          </Step>
        )}

        {step === STEP_DONE && (
          <>
            <div className="chat-message">
              <div className="chat-bubble">
                묘비는 세웠습니다.
                <br />
                그런데 아직 아무것도 새겨지지 않았네요.
              </div>
              <div className="chat-bubble">
                선생님이 어떤 분이었는지, 저는 모릅니다.
                <br />
                하지만 아는 존재가 하나 있죠.
              </div>
            </div>
            <div className="grow" />
            <div className="bottom-button-container">
              <button
                onClick={() => router.replace('/me/compose')}
                className="p-2 rounded-lg w-full"
              >
                물어보러 가기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Step({
  bubbles,
  onLogout,
  children,
}: {
  bubbles: string[];
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [shown, setShown] = useState(0);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setShown(0);
    setShowInput(false);

    const timers = bubbles.map((_, i) =>
      setTimeout(() => setShown(i + 1), 500 + i * 1000),
    );
    timers.push(
      setTimeout(() => setShowInput(true), 500 + bubbles.length * 1000),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="chat-message">
        {bubbles.slice(0, shown).map((text, i) => (
          <div key={i} className="chat-bubble fade-in">
            {text}
          </div>
        ))}
      </div>
      <div className="grow" />
      {showInput && (
        <>
          {children}
          <div className="logout-link">
            <button onClick={onLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </>
      )}
    </>
  );
}
