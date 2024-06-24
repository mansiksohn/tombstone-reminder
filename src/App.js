import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SharePage from './pages/SharePage';
import './styles/global.scss'; // 필요 시 스타일 파일 추가

function App() {
  return (
    <div className="app-container bg-black min-h-screen max-w-3xl mx-auto">
      <Router>
        <Routes>
          <Route path="/share/:userId" element={<SharePage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
