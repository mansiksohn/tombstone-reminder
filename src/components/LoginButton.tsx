'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@/lib/auth';
import { useLocale } from './LocaleProvider';

/**
 * 랜딩에서 돌아온 사람이 자기 묘비로 들어오는 문.
 *
 * 로그인은 게시 직전까지 미룬다는 원칙은 그대로다 — 처음 온 사람에게는
 * 여전히 아무것도 요구하지 않는다. 다만 이미 묘비를 세워둔 사람에게는
 * 들어올 길이 있어야 하는데, 홈이 자기 묘비가 되면서 그 길이 사라졌다.
 * 로그아웃 상태에서는 랜딩만 보이고 거기엔 로그인이 없었다.
 */
export default function LoginButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { t } = useLocale();

  const signIn = async () => {
    setError(null);
    setPending(true);

    // 콜백은 언제나 /new로 돌아온다. 묘비를 보러 온 사람이니 넘겨준다.
    const result = await signInWithGoogle('/me', t.errors.loginStartFailed);

    if (!result.ok) {
      setError(result.error ?? t.errors.loginFailed);
      setPending(false);
    }
    // 성공했다면 곧 구글로 떠난다. pending을 풀지 않는 편이 낫다 —
    // 떠나기 직전에 버튼이 되살아나면 두 번 누르게 된다.
  };

  return (
    <>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="landing-secondary-link"
      >
        {pending ? t.landing.loginPending : t.landing.loginPrompt}
      </button>
      {error && <p className="text-soul-red text-sm text-center">{error}</p>}
    </>
  );
}
