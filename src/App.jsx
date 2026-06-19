import React, { useState } from 'react';
import Home from './pages/Home';
import Invitation from './pages/Invitation';
import './index.css';

function App() {
  const [page, setPage] = useState('home'); // 'home' o 'invitation'
  const [guestName, setGuestName] = useState('');

  const handleStartInvitation = (name) => {
    setGuestName(name);
    setPage('invitation');
  };

  return (
    <div className="app-container">
      {page === 'home' && <Home onEnter={handleStartInvitation} />}
      {page === 'invitation' && <Invitation name={guestName} />}
    </div>
  );
}

export default App;
