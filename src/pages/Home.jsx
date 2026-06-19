import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import '../styles/Home.css';

const BEAR_SRC = '/images/bear.png'; 

export default function Home({ onEnter }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

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

      {/* NUBE IZQUIERDA */}
      <motion.div
        className="clouds-layer cloud-left"
        initial={{ x: '-100vw', opacity: 0 }}
        animate={isExiting ? { x: '-100vw', opacity: 0 } : { x: '-10vw', opacity: 0.9 }}
        transition={{ duration: isExiting ? 1.0 : 1.5, ease: "easeInOut" }}
      >
        <motion.img
          src="/images/clouds.png"
          alt="Nube izquierda"
          style={{ width: '100%', mixBlendMode: 'multiply' }}
          animate={{
            y: [0, -8, 8, 0],
            rotate: [0, 1.5, -1.5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* NUBE DERECHA */}
      <motion.div
        className="clouds-layer cloud-right"
        initial={{ x: '100vw', opacity: 0 }}
        animate={isExiting ? { x: '100vw', opacity: 0 } : { x: '10vw', opacity: 0.9 }}
        transition={{ duration: isExiting ? 1.0 : 1.5, ease: "easeInOut", delay: isExiting ? 0 : 0.2 }}
      >
        <motion.img
          src="/images/clouds.png"
          alt="Nube derecha"
          style={{ width: '100%', mixBlendMode: 'multiply', transform: 'scaleX(-1)' }}
          animate={{
            y: [0, 8, -8, 0],
            rotate: [0, -1.5, 1.5, 0]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* OSITO */}
      <motion.div
        className="bear-element"
        initial={{ y: -100, opacity: 0 }}
        animate={isExiting ? { y: -300, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: isExiting ? 1.0 : 1.2, ease: "easeInOut" }}
      >
        <img
          src={BEAR_SRC}
          alt="Osito"
          style={{ width: '100%', mixBlendMode: 'multiply' }}
        />
      </motion.div>

      {/* CONTENEDOR DEL SOBRE COMPLETO */}
      <motion.div
        className="envelope-wrapper"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={isExiting ? { scale: 0.3, opacity: 0, y: 150 } : { scale: 1, opacity: 1, y: 0 }}
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
          animate={isExiting ? { y: 0 } : { y: -70 }}
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
