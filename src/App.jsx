import React, { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Invitation from './pages/Invitation';
import './index.css';

function App() {
  // Intentar restaurar la sesión guardada localmente
  const savedName = localStorage.getItem('guest_name') || '';
  const [page, setPage] = useState(savedName ? 'invitation' : 'home');
  const [guestName, setGuestName] = useState(savedName);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configurar volumen al 50%
    audio.volume = 0.5;

    // Manejador para iniciar el audio en la primera interacción
    const handleUserInteraction = () => {
      if (audio.paused) {
        audio.play().catch(e => console.log("Auto-play bloqueado por el navegador:", e));
      }
    };

    // Escuchar cualquier clic o toque en la pantalla para iniciar la música
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Manejar cuando el usuario cambia de pestaña o minimiza el navegador
    const handleVisibilityChange = () => {
      if (document.hidden) {
        audio.pause();
      } else {
        // Al regresar, reanuda la música
        audio.play().catch(e => console.log("No se pudo reanudar auto-play:", e));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
      {/* Música de fondo */}
      <audio ref={audioRef} src="/images/music.mp3" loop />
      
      {page === 'home' && <Home onEnter={handleStartInvitation} />}
      {page === 'invitation' && <Invitation name={guestName} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
