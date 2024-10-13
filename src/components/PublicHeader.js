import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <h1 className="header-title">묘비log</h1>
      <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
        ☰
      </button>
      {menuOpen && <div className="menu-background" onClick={() => setMenuOpen(false)}></div>}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`}>
        <button onClick={() => setMenuOpen(false)} className="menu-close-button">✖</button>
        <div className="menu-content">
          <Link to="/" className="mb-4">
            내 묘비 보러가기
          </Link>
          <a href="https://airtable.com/appOhndwisYFELv3L/pagJhR86TzB19yBbA/form" target="_blank" rel="noopener noreferrer" className="mb-4">
            문의 및 신고
          </a>
          <div className="menu-footer">
            <img src={process.env.PUBLIC_URL + '/assets/images/wsis-logo-dark.svg'} alt="WSIS Logo" className="menu-wsis-logo" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
