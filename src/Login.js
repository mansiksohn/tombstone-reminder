import React from 'react';
import supabase from './supabaseClient';
import './App.css'; // CSS 파일을 import합니다.

const Login = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error logging in:', error.message);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1>어서오세요</h1>
        <p>아직 안죽으셨다고요?<br />
        그래도 앞으로 필요해지실겁니다.<br />
        암요 미리미리 준비해야죠.<br />
        이쪽으로 오십쇼</p>
        <img src={process.env.PUBLIC_URL + '/headstone.png'} alt="Tombstone" className="tombstone-image" />
        <button onClick={handleLogin} className="login-button">
          <img src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" alt="Sign in with Google" />
        </button>
      </div>
    </div>
  );
};

export default Login;
