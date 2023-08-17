import React, { useState } from 'react';
import supabase from './supabaseClient';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setEmailSent] = useState(false);

  async function handleLogin(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'http://localhost:3000/'
      }
    });

    if (error) {
      console.error("Error logging in:", error.message);
      setEmailSent(false); // 에러가 발생한 경우 상태 초기화
    } else {
      console.log("Magic link or OTP sent!");
      setEmailSent(true); // 메일 발송이 성공한 경우 상태 변경
    }
  }

  return (
    <div>
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email} 
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={() => handleLogin(email)}>Send Magic Link</button>

      {/* 메일 발송 상태에 따른 안내 메세지 */}
      {isEmailSent && <p>Magic link has been sent to your email!</p>}
    </div>
  );
}

export default LoginForm;
