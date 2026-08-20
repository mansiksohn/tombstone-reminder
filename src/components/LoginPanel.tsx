'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 구 코드는 구글 버튼 하나를 위해 @supabase/auth-ui-react(deprecated)를
  // 통째로 지고 있었다. signInWithOAuth 직접 호출로 대체.
  const signIn = async () => {
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-real-black text-real-white">
      <div className="login-container flex-grow flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold m-8">어서오세요</h1>
        <p className="text-base">아직 안죽으셨다고요?</p>
        <p>그래도 앞으로 필요해지실겁니다.</p>
        <p>암요 미리미리 준비해야죠.</p>
        <p>이쪽으로 오십쇼.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/login-Headstone.svg"
          alt="묘비"
          className="login-tombstone-image"
        />
        <button onClick={signIn} disabled={busy} className="rounded-lg">
          {busy ? '들어가는 중…' : 'Google로 계속하기'}
        </button>
        {error && <p className="text-soul-red mt-4 text-sm">{error}</p>}
      </div>
      <div className="footer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/wsis-logo-dark.svg"
          alt="WSIS 로고"
          className="wsis-logo"
        />
        <p>WSIS</p>
      </div>
    </div>
  );
}
