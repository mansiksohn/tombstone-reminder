import React, { useState, useEffect } from 'react';
import '../styles/index.scss'; // 모든 스타일을 한 곳에서 import
import Menu from '../components/Menu'; // Menu 컴포넌트를 불러오기

function Header({ userName }) { // userName prop을 추가
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
  }, [menuOpen]);

  return (
    <header className="header">
      <h1 className="header-title">묘꾸</h1>
      <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
        ☰
      </button>
      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} userName={userName} />
    </header>
  );
}

export default Header;
