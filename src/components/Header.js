import React, { useState, useEffect } from 'react';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import LogoutButton from '../components/LogoutButton'; // LogoutButton을 가져오기
import '../utils/supabaseService';
import '../utils/supabaseClient';

function Header({ userName }) { // userName prop을 추가
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    console.log(`Menu is now ${menuOpen ? 'open' : 'closed'}`);
  }, [menuOpen]);

  return (
    <header className="header">
      <h1 className="header-title">묘꾸</h1>
      <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
        ☰
      </button>
      {menuOpen && <div className="menu-background" onClick={() => setMenuOpen(false)}></div>}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} className="menu-close-button">✖</button>
        <div className="menu-content">
          <div className="user-name-container">
            <div className="user-name text-xl font-bold text-soul-green-500">
              {userName ? `${userName}` : 'Guest'}
              <span className="text-white">님</span>
            </div>
          </div>
          <button className="mb-4">계정 설정</button>
          <button className="mb-4">문의 및 신고</button>
          <LogoutButton />
          <div className="menu-footer">
            <img src={process.env.PUBLIC_URL + '/wsis-logo-dark.svg'} alt="WSIS Logo" className="wsis-logo" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
