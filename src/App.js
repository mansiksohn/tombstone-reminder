import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SharePage from './pages/SharePage';

function App() {
  return (
    <div className="bg-black min-h-screen max-w-3xl">
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
