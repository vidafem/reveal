import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import '../styles/Home.css';

const BACKGROUND_IMAGES = [
  '/images/im1.jpg',
  '/images/im2.jpg',
  '/images/im3.jpg'
];

export default function Home({ onEnter }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4000); // Cambia de imagen cada 4 segundos (dando tiempo para mostrarla y para la transición de 2s)
    return () => clearInterval(interval);
  }, []);

  // Generación procedimental de 35 destellos
  const sparkles = React.useMemo(() => {
    const list = [];
    const colors = [
      '#ebd5a3', // Amarillo crema / Oro claro
      '#ffffff', // Blanco puro
      '#fdfbf7', // Blanco crema
      '#c5a059', // Dorado
      '#fbcfe8', // Rosa claro
      '#93c5fd'  // Azul claro
    ];
    for (let i = 0; i < 35; i++) {
      const top = `${Math.random() * 100}%`;
      const left = `${Math.random() * 100}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = `${8 + Math.floor(Math.random() * 15)}px`; // 8px a 23px
      const duration = 3.0 + Math.random() * 4.0; // Animación más lenta (3s a 7s) para suavidad y armonía
      const delay = Math.random() * 2.5; // 0s a 2.5s
      list.push({ top, left, color, size, duration, delay });
    }
    return list;
  }, []);

  // Función para poner en mayúscula la primera letra de cada palabra
  const formatName = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleNameChange = (e) => {
    const rawValue = e.target.value;
    // Aplicamos la mayúscula en tiempo real al escribir
    setName(formatName(rawValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Reproducir sonido al hacer clic al 25% de volumen
    try {
      const audio = new Audio('/images/sobre.mp3');
      audio.volume = 0.25;
      audio.play().catch(err => console.error("Error al reproducir audio:", err));
    } catch (err) {
      console.error(err);
    }

    // Aseguramos que al guardar también vaya formateado
    const formattedName = formatName(name.trim());
    setLoading(true);

    try {
      console.log('Guardando nombre formateado:', formattedName);
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setIsExiting(true);

      setTimeout(() => {
        onEnter(formattedName);
      }, 1200);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">

      {/* BACKGROUND SLIDESHOW */}
      <div className="home-bg-slideshow">
        <AnimatePresence>
          <motion.img
            key={currentBgIndex}
            src={BACKGROUND_IMAGES[currentBgIndex]}
            alt="Background slide"
            className="home-bg-slide"
            initial={{ opacity: 0 }}
            animate={isExiting ? { opacity: 0 } : { opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="home-bg-texture"></div>
        <div className="home-bg-overlay"></div>
      </div>

      {/* DESTELLOS DE FONDO (ESTRELLITAS) */}
      <div className="home-sparkles-container">
        {sparkles.map((sp, idx) => (
          <motion.span
            key={idx}
            style={{
              position: 'absolute',
              top: sp.top,
              left: sp.left,
              color: sp.color,
              fontSize: sp.size,
              textShadow: `0 0 ${parseInt(sp.size) / 2}px ${sp.color}, 0 0 ${parseInt(sp.size)}px ${sp.color}`,
              pointerEvents: 'none',
              zIndex: 4,
              lineHeight: 1
            }}
            animate={isExiting ? { opacity: 0 } : {
              opacity: [0.1, 0.85, 0.1], // Opacidad aumentada según requerimiento
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              repeat: Infinity,
              duration: sp.duration,
              delay: sp.delay,
              ease: "easeInOut"
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>



      {/* CONTENEDOR DEL SOBRE COMPLETO */}
      <motion.div
        className="envelope-wrapper"
        initial={{ scale: 0.5, rotate: 10, opacity: 0, y: 50 }}
        animate={isExiting ? { scale: 0.3, rotate: 10, opacity: 0, y: 150 } : { scale: 1.2, rotate: 10, opacity: 1, y: 0 }}
        transition={{ 
          duration: isExiting ? 0.8 : 0.8, 
          delay: isExiting ? 0 : 1, 
          type: isExiting ? "tween" : "spring", 
          bounce: 0.4 
        }}
      >
        <div className="envelope-back"></div>

        <motion.div
          className="envelope-letter"
          initial={{ y: 0 }}
          animate={isExiting ? { y: 0 } : { y: -35 }}
          transition={{ duration: isExiting ? 0.6 : 1.2, delay: isExiting ? 0 : 2, ease: "easeInOut" }}
        >
          <h2>Acompáñanos a descubrir esta gran <br /> sorpresa</h2>
        </motion.div>

        <div className="envelope-flap-left"></div>
        <div className="envelope-flap-right"></div>
        <div className="envelope-flap-bottom"></div>
      </motion.div>

      {/* ÁREA DE ACCIÓN (INPUT Y BOTÓN) */}
      <motion.form
        className="action-area"
        onSubmit={handleSubmit}
        initial={{ y: 50, opacity: 0 }}
        animate={isExiting ? { y: 150, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: isExiting ? 0.8 : 0.8, delay: isExiting ? 0 : 2.5 }}
      >
        <input
          type="text"
          className="input-name"
          placeholder="Ingresa tu nombre"
          value={name}
          onChange={handleNameChange} // Llama a la función de formateo
        />

        <motion.button
          type="submit"
          className="submit-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Ingresar'}
        </motion.button>
      </motion.form>

    </div>
  );
}
