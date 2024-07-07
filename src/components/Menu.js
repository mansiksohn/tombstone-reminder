import React from 'react';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import LogoutButton from '../components/LogoutButton'; // LogoutButton을 가져오기

function Menu({ menuOpen, setMenuOpen, userName }) {
  return (
    <>
      {menuOpen && <div className="menu-background" onClick={() => setMenuOpen(false)}></div>}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} className="menu-close-button">✖</button>
        <div className="menu-content">
          <div className="user-name-container">
            <div className="user-name text-xl font-bold text-soul-green-500">
              {userName ? `${userName}` : '신원미상'}
              <span className="text-white">님</span>
            </div>
          </div>
          <a href="https://airtable.com/appOhndwisYFELv3L/pagJhR86TzB19yBbA/form" target="_blank" rel="noopener noreferrer" className="mb-4">
            문의 및 신고
          </a>
          <LogoutButton />
          <div className="menu-footer">
            <img src={process.env.PUBLIC_URL + '/assets/images/wsis-logo-dark.svg'} alt="WSIS Logo" className="menu-wsis-logo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Menu;
