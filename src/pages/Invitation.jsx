import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import '../styles/Invitation.css';

export default function Invitation({ name }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // Transformaciones de Scroll para las nubes:
  const nube1X = useTransform(scrollYProgress, [0, 0.4], ['0px', '350px']);
  const nube1Opacity = useTransform(scrollYProgress, [0, 0.35], [0.9, 0]);

  const nube2X = useTransform(scrollYProgress, [0, 0.4], ['0px', '-350px']);
  const nube2Opacity = useTransform(scrollYProgress, [0, 0.35], [0.9, 0]);

  const nube3X = useTransform(scrollYProgress, [0, 0.4], ['0px', '-300px']);
  const nube3Opacity = useTransform(scrollYProgress, [0, 0.35], [0.8, 0]);

  // Transformaciones de Scroll para el título "Gender Reveal":
  const titleY = useTransform(scrollYProgress, [0, 0.18], ['0px', '-180px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);

  // Transformaciones de Scroll para el Osito de la Mano (osomano.png):
  // Se mantiene intacto en Y: 50vh inicial y Y: 30vh final.
  const bearScale = useTransform(scrollYProgress, [0, 0.15], [0.55, 1.15]);
  const bearY = useTransform(scrollYProgress, [0, 0.15], ['0vh', '-20vh']);

  // Transformaciones de Scroll para la Frase:
  const phraseScale = useTransform(scrollYProgress, [0, 0.15], [0.85, 1.0]);
  const phraseY = useTransform(scrollYProgress, [0, 0.15], ['0vh', '-16vh']);
  const phraseOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  // Transformaciones de Scroll para las dos nuevas estrellas medianas (estre1.png):
  const starLeftX = useTransform(scrollYProgress, [0, 0.15], ['-20vw', '0vw']);
  const starRightX = useTransform(scrollYProgress, [0, 0.15], ['20vw', '0vw']);
  const star2Scale = useTransform(scrollYProgress, [0, 0.15], [0.4, 1.0]);
  const star2Opacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const star2Y = useTransform(scrollYProgress, [0, 0.15], ['0vh', '-16vh']);

  // Transformaciones de Scroll para las estrellitas decorativas chicas (estre.png):
  const starsOpacity = useTransform(scrollYProgress, [0, 0.25], [0.7, 0]);
  const starsY = useTransform(scrollYProgress, [0, 0.25], ['0px', '-120px']);
  const starsScrollRotate = useTransform(scrollYProgress, [0, 0.25], [0, 360]);

  // Detector de Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        if (containerRef.current.scrollTop > 5) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showIntro]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const renderHorizontalGridLines = () => {
    const lines = [];
    for (let i = 0; i <= 250; i += 10) {
      lines.push(
        <div key={`h-${i}`} className="grid-line-h" style={{ top: `${i}vh` }}>
          Y: {i}vh
        </div>
      );
    }
    return lines;
  };

  const renderVerticalGridLines = () => {
    const lines = [];
    for (let i = 10; i < 100; i += 10) {
      lines.push(
        <div key={`v-${i}`} className="grid-line-v" style={{ left: `${i}vw` }}>
          X: {i}vw
        </div>
      );
    }
    return lines;
  };

  return (
    <div className="invitation-container" ref={containerRef}>
      
      {!showIntro && (
        <button className="grid-toggle-btn" onClick={() => setShowGrid(!showGrid)}>
          {showGrid ? 'Ocultar Guías' : 'Mostrar Guías (Coordenadas)'}
        </button>
      )}

      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
            className="intro-screen"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="intro-title">
                ¡Bienvenido, {name}!
              </h1>
              
              <p className="intro-subtitle">
                Estás cordialmente invitad@ a celebrar con nosotros
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="invitation-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="invitation-content"
          >
            {showGrid && (
              <div className="dev-grid-container">
                {renderHorizontalGridLines()}
                {renderVerticalGridLines()}
              </div>
            )}

            {/* ==============================================================
               ESTRELLITAS CHICAS (estre.png) - BAJADAS 6vh CADA UNA
               ============================================================== */}
            {/* Estrella 1: bajada de Y: 26vh a Y: 32vh */}
            <motion.div
              className="decor-star"
              style={{ 
                top: '32vh', 
                left: '10vw',
              }}
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            >
              <motion.div style={{ y: starsY, opacity: starsOpacity, rotate: starsScrollRotate }}>
                <motion.img 
                  src="/images/estre.png" 
                  alt="Estrella 1" 
                  style={{ width: '100%', mixBlendMode: 'multiply' }}
                  animate={{ rotate: [-45, 45, -45] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Estrella 2: bajada de Y: 16vh a Y: 22vh */}
            <motion.div
              className="decor-star"
              style={{ 
                top: '22vh', 
                left: '60vw',
              }}
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
            >
              <motion.div style={{ y: starsY, opacity: starsOpacity, rotate: starsScrollRotate }}>
                <motion.img 
                  src="/images/estre.png" 
                  alt="Estrella 2" 
                  style={{ width: '100%', mixBlendMode: 'multiply' }}
                  animate={{ rotate: [45, -45, 45] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* Estrella 3: bajada de Y: 6vh a Y: 12vh */}
            <motion.div
              className="decor-star"
              style={{ 
                top: '12vh', 
                left: '10vw',
              }}
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
            >
              <motion.div style={{ y: starsY, opacity: starsOpacity, rotate: starsScrollRotate }}>
                <motion.img 
                  src="/images/estre.png" 
                  alt="Estrella 3" 
                  style={{ width: '100%', mixBlendMode: 'multiply' }}
                  animate={{ rotate: [-30, 30, -30] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>

            {/* ==============================================================
               ESTRELLAS DE REVELACIÓN (estre1.png)
               ============================================================== */}
            <motion.div
              className="decor-star-two"
              style={{ 
                top: '66vh', 
                left: '10vw',
                x: starLeftX,
                y: star2Y,
                scale: star2Scale,
                opacity: star2Opacity
              }}
            >
              <motion.img 
                src="/images/estre1.png" 
                alt="Estrella Revelación Izquierda" 
                style={{ width: '100%', mixBlendMode: 'multiply' }}
                animate={{ rotate: [-15, 15, -15] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />
            </motion.div>

            <motion.div
              className="decor-star-two"
              style={{ 
                top: '66vh', 
                right: '10vw',
                x: starRightX,
                y: star2Y,
                scale: star2Scale,
                opacity: star2Opacity
              }}
            >
              <motion.img 
                src="/images/estre1.png" 
                alt="Estrella Revelación Derecha" 
                style={{ width: '100%', mixBlendMode: 'multiply', transform: 'scaleX(-1)' }}
                animate={{ rotate: [15, -15, 15] }}
                transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
              />
            </motion.div>

            {/* NUBES EN LA PARTE SUPERIOR */}
            <div className="invitation-clouds-container">
              <motion.div
                className="invitation-cloud invitation-cloud-left"
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 0.9 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ x: nube1X, opacity: nube1Opacity }}
              >
                <motion.img
                  src="/images/nube1.png"
                  alt="Nube 1"
                  style={{ width: '100%' }}
                  animate={{
                    y: [0, -16, 12, 0],
                    rotate: [0, 2.5, -2.5, 0]
                  }}
                  transition={{
                    duration: 5.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.div
                className="invitation-cloud invitation-cloud-right"
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 0.9 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                style={{ x: nube2X, opacity: nube2Opacity }}
              >
                <motion.img
                  src="/images/nube1.png"
                  alt="Nube 2"
                  style={{ width: '100%', transform: 'scaleX(-1)' }}
                  animate={{
                    y: [0, 10, -18, 0],
                    rotate: [0, -2, 2, 0]
                  }}
                  transition={{
                    duration: 7.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              <motion.div
                className="invitation-cloud invitation-cloud-three"
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                style={{ x: nube3X, opacity: nube3Opacity }}
              >
                <motion.img
                  src="/images/nube1.png"
                  alt="Nube 3"
                  style={{ width: '100%' }}
                  animate={{
                    y: [0, -14, 14, -6, 0],
                    rotate: [0, 3.5, -1.5, 0]
                  }}
                  transition={{
                    duration: 9.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>

            {/* SECCIÓN 1: HÉROE (Portada) */}
            <section className="hero-section">
              {/* Título "Gender Reveal" - BAJADO a 24vh */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                style={{ position: 'absolute', top: '24vh', left: '50%', x: '-50%', zIndex: 1 }}
              >
                <motion.h2 
                  className="gender-reveal-title"
                  style={{ y: titleY, opacity: titleOpacity }}
                >
                  <span className="gender-word">Gender</span>
                  <span className="reveal-word">Reveal</span>
                </motion.h2>
              </motion.div>

              {/* EL OSITO DE LA MANO (osomano.png) */}
              <motion.div
                className="invitation-bear-osomano"
                style={{ 
                  top: '50vh',
                  left: '50%',
                  x: '-50%',
                  scale: bearScale, 
                  y: bearY
                }}
              >
                {/* Intensidad incrementada de flotación Y: de -28px a -48px para que flote mucho más alto y de forma más intensa */}
                <motion.img 
                  src="/images/osomano.png" 
                  alt="Osito mano" 
                  style={{ width: '100%' }}
                  animate={isScrolled ? { y: 0 } : { y: [0, -48, 0] }}
                  transition={isScrolled ? { duration: 0.3 } : { repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                />
              </motion.div>

              {/* FRASE DE PORTADA EN SERIF MAYÚSCULAS */}
              <motion.div 
                className="invitation-phrase"
                style={{ 
                  top: '76vh', 
                  left: '50%',
                  x: '-50%',
                  y: phraseY, 
                  scale: phraseScale,
                  opacity: phraseOpacity 
                }}
              >
                <h2>
                  Pronto habrá una nueva sonrisa <br /> 
                  iluminando nuestras vidas
                </h2>
              </motion.div>
              
              <div className="scroll-indicator">
                <span>Desliza para ver más</span>
                <motion.div 
                  className="scroll-arrow"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  ↓
                </motion.div>
              </div>
            </section>

            {/* SECCIÓN 2: DETALLES */}
            <section className="details-section">
              <h3 className="details-title">Detalles del Evento</h3>
              <p className="details-text">
                ¡Aquí colocaremos toda la magia! Música de fondo, cuenta regresiva, dirección, fecha y el sistema de confirmación de asistencia.
              </p>
            </section>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
