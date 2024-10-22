import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SharePage from './pages/SharePage';
import './styles/global.scss';
import { Analytics } from '@vercel/analytics/react';  // Analytics 추가

function App() {
  return (
    <div className="app-container bg-black min-h-screen max-w-3xl mx-auto">
      <Router>
        <Routes>
          <Route path="/share/:userId" element={<SharePage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <Analytics /> {/* Analytics 컴포넌트 추가 */}
    </div>
  );
}

export default App;