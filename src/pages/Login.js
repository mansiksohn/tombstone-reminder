import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import supabase from '../utils/supabaseClient';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import

function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-real-black text-real-white">
      <div className="login-container flex-grow flex flex-col items-center justify-center">
        <h1 className="header text-2xl font-bold">어서오세요</h1>
        <p className="text-base">아직 안죽으셨다고요?</p>
        <p>그래도 앞으로 필요해지실겁니다.</p>
        <p>암요 미리미리 준비해야죠.</p>
        <p>이쪽으로 오십쇼.</p>
        <img src={process.env.PUBLIC_URL + '/assets/images/login-Headstone.svg'} alt="Tombstone" className="tombstone-image" />
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="dark"
          onlyThirdPartyProviders
        />
      </div>
      <div className="footer">
        <img src={process.env.PUBLIC_URL + '/assets/images/wsis-logo-dark.svg'} alt="WSIS Logo" className="wsis-logo" />
        <p>WSIS</p>
      </div>
    </div>
  );
}

export default Login;