import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import '../styles/Invitation.css';

// Variantes para animación letra por letra de la frase
const sentenceContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // velocidad rápida pero fluida
    }
  }
};

const letterVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 130,
    }
  }
};

export default function Invitation({ name }) {
  const [showIntro, setShowIntro] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef(null);

  const renderAnimatedLetters = (text) => {
    return text.split("").map((char, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
      >
        {char}
      </motion.span>
    ));
  };

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

  // Transformaciones de Scroll escalonadas para la sección de detalles:
  // ===============================================================================================
  // CONFIGURACIÓN DE ANIMACIONES POR SCROLL (VINCULADAS AL DESLIZAMIENTO DE LA PANTALLA)
  // useTransform(scrollYProgress, [rango_scroll_entrada], [valores_salida_visuales])
  // - scrollYProgress: Valor de 0 (arriba del todo) a 1 (abajo del todo) del scroll.
  // - rango_scroll_entrada: Array de números decimales de 0 a 1 que marcan el momento del scroll.
  // - valores_salida_visuales: Array con los estilos que tomará el elemento en cada punto marcado.
  // ===============================================================================================

  // 1. Título "Acompáñanos a descubrirlo" (Zoom-out + Opacidad):
  // - [0.01, 0.13]: Rango de scroll de inicio a fin del movimiento del título.
  // - [0, 5]: La opacidad va de 0 a 5 (se intensifica rápidamente).
  // - [1.25, 1.0]: La escala va de 1.25 (grande) a 1.0 (tamaño normal), haciendo el efecto Zoom-out.
  // - ['125px', '-125px']: Desplazamiento vertical en píxeles.
  const titleNewOpacity = useTransform(scrollYProgress, [0.01, 0.13], [0, 5]);
  const titleNewScale = useTransform(scrollYProgress, [0.01, 0.13], [1.25, 1.0]);
  const titleNewY = useTransform(scrollYProgress, [0.01, 0.13], ['125px', '-125px']);

  // 2. Fecha "Viernes | 09 | Mayo" (Zoom-in + Opacidad):
  // Aparece de forma escalonada después del título.
  // - [0.07, 0.19]: Rango de scroll de inicio a fin de la fecha.
  // - [0, 1]: Opacidad de 0 a 1.
  // - [0.85, 1.0]: Escala de 0.85 a 1.0 (Zoom-in sutil).
  // - ['50px', '-135px']: Desplazamiento vertical.
  const dateOpacity = useTransform(scrollYProgress, [0.07, 0.19], [0, 1]);
  const dateScale = useTransform(scrollYProgress, [0.07, 0.19], [0.85, 1.0]);
  const dateY = useTransform(scrollYProgress, [0.07, 0.19], ['50px', '-135px']);

  // 3. Tarjeta de detalles (Hora, Lugar, Dirección):
  // Aparece al final del escalonado.
  // - [0.13, 0.25]: Rango de scroll de la tarjeta.
  // - [0, 1]: Opacidad de 0 a 1.
  // - [0.85, 1.0]: Escala de 0.85 a 1.0 (Zoom-in).
  // - ['80px', '-160px']: Desplazamiento vertical.
  const cardOpacity = useTransform(scrollYProgress, [0.13, 0.25], [0, 1]);
  const cardScale = useTransform(scrollYProgress, [0.13, 0.25], [0.85, 1.0]);
  const cardY = useTransform(scrollYProgress, [0.13, 0.25], ['80px', '-160px']);

  // 4. Osito sentado (Aparece rotando e incorporándose desde la izquierda):
  // - [0.12, 0.24]: Rango de scroll.
  // - [0, 1.0]: Opacidad final. Puedes cambiar el 1.0 de abajo por 0.8 si quieres regular la opacidad al 80%, etc.
  // - ['-100px', '0px']: Movimiento lateral en X de izquierda a derecha.
  // - [-90, 0]: Rotación de -90 grados (acostado de lado) a 0 grados (parado).
  const bearSeatedOpacity = useTransform(scrollYProgress, [0.12, 0.24], [0, 0.1]);
  const bearSeatedX = useTransform(scrollYProgress, [0.12, 0.24], ['-100px', '0px']);
  const bearSeatedRotate = useTransform(scrollYProgress, [0.12, 0.24], [-90, 0]);

  // 5. Nube decorativa detrás del título (Paso de izquierda a derecha por el centro):
  // - [0.01, 0.11, 0.22]: Rango de scroll (Inicio, Centro y Fin de la animación).
  // - ['-300px', '0px', '300px']: Posición X. Viene de la izquierda (-300px), llega al centro (0px) y sale por la derecha (300px).
  // - [0, 1, 0]: Opacidad. Empieza invisible (0), se hace 100% visible en el centro (1), y se desvanece al salir a la derecha (0).
  const detailsCloudOpacity = useTransform(scrollYProgress, [0.01, 0.11, 0.22], [0, 1, 0]);
  const detailsCloudX = useTransform(scrollYProgress, [0.01, 0.11, 0.22], ['-300px', '0px', '300px']);

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
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Forzar actualización de scroll de Framer Motion al quitar el intro
  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          // Forzamos un microscroll nativo para disparar los recálculos en el navegador y en Framer Motion
          containerRef.current.scrollTop = 1;
          containerRef.current.scrollTop = 0;
          containerRef.current.dispatchEvent(new Event('scroll'));
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

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
              >
                <motion.div style={{ x: nube1X, opacity: nube1Opacity, width: '100%' }}>
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
              </motion.div>

              <motion.div
                className="invitation-cloud invitation-cloud-right"
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 0.9 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              >
                <motion.div style={{ x: nube2X, opacity: nube2Opacity, width: '100%' }}>
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
              </motion.div>

              <motion.div
                className="invitation-cloud invitation-cloud-three"
                initial={{ x: '100vw', opacity: 0 }}
                animate={{ x: 0, opacity: 0.8 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
              >
                <motion.div style={{ x: nube3X, opacity: nube3Opacity, width: '100%' }}>
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
              </motion.div>
            </div>

            {/* SECCIÓN 1: HÉROE (Portada) */}
            <section className="hero-section">
              {/* Título "Gender Reveal" - BAJADO a 24vh */}
              <motion.div
                className="gender-reveal-title-container"
                initial={{ opacity: 0, y: 40, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
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
              <div className="invitation-bear-container">
                <motion.div
                  className="invitation-bear-osomano"
                  style={{
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
              </div>

              {/* FRASE DE PORTADA EN SERIF MAYÚSCULAS */}
              <div className="invitation-phrase-container">
                <motion.div
                  className="invitation-phrase"
                  style={{
                    y: phraseY,
                    scale: phraseScale,
                    opacity: phraseOpacity
                  }}
                  variants={sentenceContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.h2
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  >
                    <span style={{ display: "block" }}>
                      {renderAnimatedLetters("Pronto habrá ")}
                    </span>
                    <span style={{ display: "block" }}>
                      {renderAnimatedLetters("una nueva sonrisa")}
                    </span>
                    <span style={{ display: "block", marginTop: "0.3rem" }}>
                      {renderAnimatedLetters("iluminando nuestras vidas")}
                    </span>
                  </motion.h2>
                </motion.div>
              </div>
            </section>

            {/* ==============================================================
               SECCIÓN 2: DETALLES DEL EVENTO
               (Aquí puedes editar la fecha, hora, dirección y lugar directamente)
               ============================================================== */}
            <section className="details-section">

              {/* Título de la sección y su nube de fondo */}
              <div className="details-title-container">
                {/* Contenedor estático centrado por CSS */}
                <div className="details-title-cloud-bg">
                  {/* Contenedor interno animado por Framer Motion */}
                  <motion.div
                    style={{
                      opacity: detailsCloudOpacity,
                      x: detailsCloudX,
                      y: titleNewY,
                      width: '100%'
                    }}
                  >
                    <motion.img
                      src="/images/nube3.png"
                      alt="Nube decorativa detalles"
                      style={{ width: '100%', mixBlendMode: 'multiply' }}
                      animate={{
                        y: [0, -6, 6, 0]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>

                <motion.h3
                  className="details-title-new"
                  style={{
                    opacity: titleNewOpacity,
                    scale: titleNewScale,
                    y: titleNewY
                  }}
                >
                  Acompáñanos a descubrirlo
                </motion.h3>
              </div>

              {/* ==========================================
                  FECHA DEL EVENTO 
                  (Edita el día, número y mes directamente aquí)
                 ========================================== */}
              <motion.div
                className="event-date-container"
                style={{
                  opacity: dateOpacity,
                  scale: dateScale,
                  y: dateY
                }}
              >
                <span className="event-date-day">Viernes</span>
                <span className="event-date-divider">|</span>
                <span className="event-date-number">09</span>
                <span className="event-date-divider">|</span>
                <span className="event-date-month">Mayo</span>
              </motion.div>

              {/* ==========================================
                  DETALLES DE HORA, LUGAR Y DIRECCIÓN
                  (Edita los datos e información directamente aquí)
                 ========================================== */}
              <motion.div
                className="event-details-row"
                style={{
                  opacity: cardOpacity,
                  scale: cardScale,
                  y: cardY
                }}
              >
                {/* Imagen del osito sentado posicionado de forma absoluta al lado izquierdo y detrás */}
                <motion.div
                  className="event-details-bear"
                  style={{
                    opacity: bearSeatedOpacity,
                    x: bearSeatedX,
                    rotate: bearSeatedRotate,
                    y: '-50%',
                    originX: 0,
                    originY: 1
                  }}
                >
                  <img
                    src="/images/ososentado.png"
                    alt="Osito sentado"
                    className="bear-seated-img"
                  />
                </motion.div>

                <div className="event-details-info">
                  <div className="info-item" style={{ position: 'relative' }}>
                    <span className="info-label">Hora:</span>
                    <span className="info-value">15:00 horas</span>

                    {/* Estrella decorativa al lado derecho de la hora (Copia de estre1.png y su animación) */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        right: '-32px', // Posicionada a la derecha de la hora
                        top: '50%',
                        y: '-50%',
                        width: '42px', // Estrella más grande
                        height: 'auto',
                        pointerEvents: 'none'
                      }}
                    >
                      <motion.img
                        src="/images/estre1.png"
                        alt="Estrella detalles"
                        style={{ width: '100%', mixBlendMode: 'multiply' }}
                        animate={{ rotate: [15, -15, 15] }}
                        transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lugar:</span>
                    <span className="info-value">Urbanización</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dirección:</span>
                    <span className="info-value">Chongón km 10</span>
                  </div>
                </div>
              </motion.div>

            </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de scroll fijo flotante (aparece después del intro y desaparece al hacer scroll) */}
      <AnimatePresence>
        {!isScrolled && !showIntro && (
          <motion.div
            className="fixed-scroll-indicator"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="fixed-scroll-arrow-container"
            >
              <span className="fixed-scroll-arrow">↓</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
