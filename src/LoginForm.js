import React, { useState } from 'react';
import supabase from './supabaseClient';

function LoginForm({ onLogin }) {
    const [email, setEmail] = useState('');
  
    const handleLogin = async () => {
      const { error } = await supabase.auth.signIn({ email });
      if (error) {
        console.error("Error sending magic link:", error.message);
      } else {
        // 이 부분에서 사용자에게 이메일 확인 안내 메시지를 표시합니다.
        alert('Magic link has been sent to your email. Please check.');
      }
    }
  
    return (
      <div>
        <input 
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleLogin}>Login with Magic Link</button>
      </div>
    );
  }
  
  export default LoginForm;
