import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Invitation from './pages/Invitation';
import './index.css';

function App() {
  // Intentar restaurar la sesión guardada localmente
  const savedName = localStorage.getItem('guest_name') || '';
  const [page, setPage] = useState(savedName ? 'invitation' : 'home');
  const [guestName, setGuestName] = useState(savedName);

  const handleStartInvitation = (name) => {
    // Guardar el nombre en localStorage para mantener la sesión al refrescar
    localStorage.setItem('guest_name', name);
    setGuestName(name);
    setPage('invitation');
  };

  const handleLogout = () => {
    localStorage.removeItem('guest_name');
    localStorage.removeItem('user_prediction');
    localStorage.removeItem('user_rsvp');
    setGuestName('');
    setPage('home');
  };

  return (
    <div className="app-container">
      {page === 'home' && <Home onEnter={handleStartInvitation} />}
      {page === 'invitation' && <Invitation name={guestName} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
