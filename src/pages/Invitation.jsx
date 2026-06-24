import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../supabaseClient';
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

// Variantes para Código de Vestimenta y Regalo
const dresscodeContainerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.12
    }
  }
};

const dresscodeLunaVariants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 100 }
  }
};

const dresscodeTitleVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 100 }
  }
};

const dresscodeTextVariants = {
  hidden: { scale: 1.3, opacity: 0 },
  visible: {
    scale: 1.0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const giftCardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

const sparkles = [
  { top: '12%', left: '8%', color: '#c5a059', delay: 0.1, duration: 2.1, size: '10px' },
  { top: '22%', right: '10%', color: '#93c5fd', delay: 0.5, duration: 2.8, size: '12px' },
  { top: '35%', left: '15%', color: '#fbcfe8', delay: 0.8, duration: 2.4, size: '8px' },
  { top: '18%', right: '25%', color: '#ffffff', delay: 0.3, duration: 3.2, size: '10px' },
  { bottom: '28%', left: '12%', color: '#93c5fd', delay: 1.2, duration: 2.5, size: '11px' },
  { bottom: '15%', right: '15%', color: '#c5a059', delay: 0.7, duration: 1.9, size: '13px' },
  { bottom: '22%', left: '25%', color: '#ffffff', delay: 0.2, duration: 2.7, size: '9px' },
  { bottom: '35%', right: '8%', color: '#fbcfe8', delay: 0.9, duration: 2.3, size: '12px' },
  { top: '52%', left: '7%', color: '#fbcfe8', delay: 1.4, duration: 2.0, size: '10px' },
  { top: '65%', right: '6%', color: '#93c5fd', delay: 0.4, duration: 2.6, size: '11px' },
  { bottom: '48%', left: '20%', color: '#c5a059', delay: 1.0, duration: 2.2, size: '8px' },
  { bottom: '50%', right: '22%', color: '#ffffff', delay: 0.6, duration: 2.9, size: '12px' }
];

// Componente individual para cada destello de fondo con animación Parallax
function BackgroundSparkle({ sp, scrollYProgress }) {
  // Transforma el scroll de 0 a 1 a una traslación vertical entre 0 y sp.scrollOffset
  const yVal = useTransform(scrollYProgress, [0, 1], [0, sp.scrollOffset]);

  return (
    <motion.span
      style={{
        position: 'absolute',
        top: sp.top,
        left: sp.left,
        color: sp.color,
        fontSize: sp.size,
        pointerEvents: 'none',
        lineHeight: 1,
        y: yVal,
        zIndex: 1,
      }}
      animate={{
        opacity: [0.08, 0.75, 0.08],
        scale: [0.7, 1.25, 0.7]
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
  );
}

export default function Invitation({ name }) {
  const [showIntro, setShowIntro] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const containerRef = useRef(null);

  const [userPrediction, setUserPrediction] = useState(null);
  const [votes, setVotes] = useState({ boy: 0, girl: 0 });
  const [userRSVP, setUserRSVP] = useState(null); // null = not decided, true = yes, false = no
  const [showRSVPModal, setShowRSVPModal] = useState(false);

  // Función para obtener los totales de la base de datos
  const fetchVotesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('prediction');

      if (error) {
        console.warn('No se pudieron cargar votos de Supabase, usando locales:', error.message);
        return;
      }

      if (data) {
        const counts = data.reduce((acc, curr) => {
          if (curr.prediction === 'boy') acc.boy++;
          if (curr.prediction === 'girl') acc.girl++;
          return acc;
        }, { boy: 0, girl: 0 });

        // Usar solo los votos reales de Supabase
        setVotes({
          boy: counts.boy,
          girl: counts.girl
        });
      }
    } catch (err) {
      console.error('Error fetching votes:', err);
    }
  };

  // Cargar predicción previa y RSVP del usuario actual y totales al montar el componente
  useEffect(() => {
    const initPrediction = async () => {
      // 1. Obtener totales
      await fetchVotesFromSupabase();

      // 2. Comprobar si este invitado ya tiene un registro en Supabase
      if (name) {
        try {
          const { data, error } = await supabase
            .from('invitations')
            .select('prediction, confirmed_attendance')
            .eq('name', name)
            .maybeSingle();

          if (error) {
            console.warn('Error fetching individual prediction/RSVP:', error.message);
            const localPred = localStorage.getItem('user_prediction');
            if (localPred) setUserPrediction(localPred);
            const localRSVP = localStorage.getItem('user_rsvp');
            if (localRSVP) setUserRSVP(localRSVP === 'yes');
            return;
          }

          if (data) {
            if (data.prediction) {
              setUserPrediction(data.prediction);
              localStorage.setItem('user_prediction', data.prediction);
            }
            if (data.confirmed_attendance !== null) {
              setUserRSVP(data.confirmed_attendance);
              localStorage.setItem('user_rsvp', data.confirmed_attendance ? 'yes' : 'no');
            }
          } else {
            const localPred = localStorage.getItem('user_prediction');
            const localRSVP = localStorage.getItem('user_rsvp');
            if (localPred || localRSVP !== null) {
              if (localPred) setUserPrediction(localPred);
              if (localRSVP !== null) setUserRSVP(localRSVP === 'yes');
              
              // Sincronizar local a DB si no estaba
              await supabase
                .from('invitations')
                .insert({
                  name: name,
                  prediction: localPred || null,
                  confirmed_attendance: localRSVP !== null ? (localRSVP === 'yes') : null
                });
              await fetchVotesFromSupabase();
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    initPrediction();
  }, [name]);

  const handlePrediction = async (gender) => {
    let newPrediction = gender;

    if (userPrediction === gender) {
      // Desmarcar voto — actualización optimista inmediata
      newPrediction = null;
      setUserPrediction(null);
      localStorage.removeItem('user_prediction');
      setVotes(prev => ({ ...prev, [gender]: Math.max(0, prev[gender] - 1) }));

      try {
        const { error } = await supabase
          .from('invitations')
          .delete()
          .eq('name', name);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting prediction:', err);
      }
    } else {
      // Marcar nuevo voto o actualizar el existente — actualización optimista inmediata
      const prevPrediction = userPrediction;
      setUserPrediction(gender);
      localStorage.setItem('user_prediction', gender);
      setVotes(prev => {
        const updated = { ...prev, [gender]: prev[gender] + 1 };
        if (prevPrediction) updated[prevPrediction] = Math.max(0, updated[prevPrediction] - 1);
        return updated;
      });

      try {
        const { data: existing, error: selectError } = await supabase
          .from('invitations')
          .select('id')
          .eq('name', name)
          .maybeSingle();

        if (selectError) throw selectError;

        if (existing) {
          const { error: updateError } = await supabase
            .from('invitations')
            .update({ prediction: gender })
            .eq('name', name);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('invitations')
            .insert({ name: name, prediction: gender });
          if (insertError) throw insertError;
        }
      } catch (err) {
        console.error('Error saving prediction:', err);
      }
    }

    // Sincronizar con los totales reales de Supabase en segundo plano
    await fetchVotesFromSupabase();
  };

  const handleRSVP = async (status) => {
    setUserRSVP(status);
    localStorage.setItem('user_rsvp', status ? 'yes' : 'no');

    try {
      const { data: existing, error: selectError } = await supabase
        .from('invitations')
        .select('id')
        .eq('name', name)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ confirmed_attendance: status })
          .eq('name', name);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('invitations')
          .insert({
            name: name,
            confirmed_attendance: status,
            prediction: userPrediction || null
          });
        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error saving RSVP:', err);
    }
  };

  const totalVotes = votes.boy + votes.girl;
  const boyPercentage = totalVotes > 0 ? Math.round((votes.boy / totalVotes) * 100) : 50;
  const girlPercentage = totalVotes > 0 ? Math.round((votes.girl / totalVotes) * 100) : 50;
  // Generación procedimental de 70 destellos del fondo con colores amarillos y cafés
  const backgroundSparkles = React.useMemo(() => {
    const list = [];
    const colors = [
      '#c5a059', // Dorado / Amarillo oscuro
      '#7b5b42', // Café oscuro
      '#d4a373', // Café claro / Arena
      '#8c6e58', // Café medio
      '#b28e47', // Oro viejo
      '#ebd5a3', // Amarillo crema / Oro claro
      '#fdfbf7'  // Blanco crema
    ];
    // Distribuimos los destellos uniformemente de 2% a 98% a lo largo de la página
    for (let i = 0; i < 70; i++) {
      const topVal = 2 + (i * 96 / 70) + (Math.random() * 1.5 - 0.75);
      const top = `${Math.min(99, Math.max(1, topVal))}%`;
      const left = `${4 + Math.random() * 92}%`;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = `${13 + Math.floor(Math.random() * 14)}px`; // 13px a 26px
      const duration = 1.8 + Math.random() * 1.8; // 1.8s a 3.6s
      const delay = Math.random() * 2.5; // 0s a 2.5s
      // Desplazamiento vertical máximo por scroll (-160px a +160px)
      const scrollOffset = -160 + Math.random() * 320;
      list.push({ top, left, color, size, duration, delay, scrollOffset });
    }
    return list;
  }, []);

  const downloadIcs = () => {
    const event = {
      title: "Gender Reveal Maritza Hidalgo",
      description: "¡Acompáñanos a descubrir el género de nuestro bebé!",
      location: "Chongon - Paseo del Sol 4 Mz 7801 SL 22, Urbanización Paseo del Sol",
      start: "20260815T150000",
      end: "20260815T190000"
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Antigravity//Gender Reveal//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Recordatorio de Gender Reveal",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "gender_reveal.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
  const bearSeatedOpacity = useTransform(scrollYProgress, [0.12, 0.24], [0, 1.0]);
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



  return (
    <div className="invitation-container" ref={containerRef}>



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
            {/* Contenedor de estrellas y destellos en el fondo de toda la página */}
            <div className="page-bg-sparkles-container">
              {backgroundSparkles.map((sp, idx) => (
                <BackgroundSparkle key={idx} sp={sp} scrollYProgress={scrollYProgress} />
              ))}
            </div>


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
                <motion.p
                  className="gender-reveal-subtitle"
                  style={{ y: titleY, opacity: titleOpacity }}
                >
                  <span className="subtitle-ornament">✦</span>
                  <span className="subtitle-names">Cumbe · Hidalgo</span>
                  <span className="subtitle-ornament">✦</span>
                </motion.p>
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
                <span className="event-date-day">Sábado</span>
                <span className="event-date-divider">|</span>
                <span className="event-date-number">15</span>
                <span className="event-date-divider">|</span>
                <span className="event-date-month">Agosto</span>
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
                  <motion.img
                    src="/images/ososentado.png"
                    alt="Osito sentado"
                    className="bear-seated-img"
                    animate={{
                      y: [0, -6, 0],
                      rotate: [0, 1.5, -1.5, 0]
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
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
                    <span className="info-value">Urbanización Paseo del Sol</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dirección:</span>
                    <span className="info-value">Chongon - Paseo del Sol 4 Mz 7801 SL 22</span>
                  </div>

                  <div className="details-actions-container">
                    <a
                      href="https://www.google.com/maps?q=-2.241208553314209,-80.0711669921875&z=17&hl=es"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="details-action-btn"
                    >
                      <span>📍 Cómo llegar</span>
                    </a>
                    <button
                      className="details-action-btn"
                      onClick={() => setShowCalendarModal(true)}
                    >
                      <span>📅 Agregar a tus eventos</span>
                    </button>
                  </div>
                </div>
              </motion.div>

            </section>

            {/* SECCIÓN 3: CÓDIGO DE VESTIMENTA */}
            <motion.section
              className="dresscode-section"
              variants={dresscodeContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
            >
              <div className="dresscode-header">
                <motion.h3
                  className="dresscode-title"
                  variants={dresscodeTitleVariants}
                >
                  <span className="dresscode-word">Código de</span>
                  <span className="dresscode-word">Vestimenta</span>
                </motion.h3>
                <motion.div
                  variants={dresscodeLunaVariants}
                  className="dresscode-icon-wrapper"
                >
                  <motion.img
                    src="/images/luna.png"
                    alt="Luna"
                    className="dresscode-icon"
                    animate={{
                      y: [0, -8, 0],
                      rotate: [-4, 4, -4]
                    }}
                    transition={{
                      duration: 4.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
              <motion.p
                className="dresscode-text"
                variants={dresscodeTextVariants}
              >
                ¡Vístete de blanco, beige o del color que consideres que sea para ser parte de este momento especial!
              </motion.p>
            </motion.section>

            {/* SECCIÓN 4: TARJETA REGALO */}
            <motion.div
              className="gift-card-container"
              variants={giftCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.15 }}
            >
              <div className="gift-card">
                <div className="gift-card-notch"></div>

                {/* Destellos sutiles de colores brillantes que parpadean de fondo en la tarjeta */}
                {sparkles.map((sp, idx) => (
                  <motion.span
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: sp.top,
                      left: sp.left,
                      right: sp.right,
                      bottom: sp.bottom,
                      color: sp.color,
                      fontSize: sp.size,
                      pointerEvents: 'none',
                      zIndex: 1,
                      lineHeight: 1
                    }}
                    animate={{
                      opacity: [0.1, 0.9, 0.1],
                      scale: [0.75, 1.25, 0.75]
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

                <div className="gift-card-header">
                  <motion.img
                    src="/images/fugaz.jpg"
                    className="gift-card-icon-left"
                    alt="Estrella fugaz"
                    animate={{
                      opacity: [0.35, 1, 0.35],
                      scale: [0.93, 1.07, 0.93]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <h3 className="gift-card-title">Regalo</h3>
                  <motion.img
                    src="/images/destello.jpg"
                    className="gift-card-icon-right"
                    alt="Destello"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.95, 1.05, 0.95]
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4
                    }}
                  />
                </div>

                <h4 className="gift-card-subtitle">¿Te animas a adivinar?</h4>
                <p className="gift-card-subtext">Si crees que es</p>

                <div className="gift-columns">
                  <div className="gift-column">
                    <span className="gift-team-title">Team niño</span>
                    <span className="gift-team-desc">Trae Pañales de preferencia: marca marca</span>
                  </div>

                  <div className="gift-divider-star">✦</div>

                  <div className="gift-column">
                    <span className="gift-team-title">Team niña</span>
                    <span className="gift-team-desc">Trae toallitas húmedas de preferencia: marca marca</span>

                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECCIÓN 5: PREDICCIÓN */}
            <motion.section
              className="prediction-section"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h3 className="prediction-title">¿Cuál es tu predicción?</h3>
              <p className="prediction-subtitle">Selecciona el botón de tu predicción</p>

              {/* Imagen de los ositos */}
              <div className="prediction-bears-container">
                <img
                  src="/images/ositos.png"
                  alt="Predicción de género"
                  className="prediction-bears-img"
                />
              </div>

              {/* Botones para votar */}
              <div className="prediction-buttons">
                <motion.button
                  className={`prediction-btn btn-boy ${userPrediction === 'boy' ? 'selected' : ''}`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePrediction('boy')}
                >
                  Niño
                </motion.button>
                <motion.button
                  className={`prediction-btn btn-girl ${userPrediction === 'girl' ? 'selected' : ''}`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePrediction('girl')}
                >
                  Niña
                </motion.button>
              </div>

              {/* Resultados */}
              <div className="prediction-results">
                <h4 className="results-title">Resultados</h4>
                <div className="results-percentages">
                  <span className="results-pct results-pct-boy">{boyPercentage}% Niño</span>
                  <span className="results-pct results-pct-girl">{girlPercentage}% Niña</span>
                </div>
                {/* Barra horizontal split */}
                <div className="results-bar-container">
                  <motion.div
                    className="results-bar-boy"
                    animate={{ width: `${boyPercentage}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  />
                  <motion.div
                    className="results-bar-girl"
                    animate={{ width: `${girlPercentage}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  />
                </div>
              </div>
            </motion.section>

            {/* SECCIÓN 6: CONFIRMACIÓN DE ASISTENCIA (RSVP) */}
            <motion.section
              className="rsvp-section"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="rsvp-card">
                {/* Banderilla decorativa colgada al tope de la tarjeta */}
                <div className="rsvp-banderilla-container">
                  <img
                    src="/images/banderilla.png"
                    alt="Banderillas"
                    className="rsvp-banderilla-img"
                  />
                </div>

                {/* Osito con globo en el centro */}
                <div className="rsvp-bear-container">
                  <img
                    src="/images/osooos.png"
                    alt="Osito con globo"
                    className="rsvp-bear-img"
                  />
                </div>

                {/* Textos informativos de la tarjeta */}
                <div className="rsvp-content">
                  <p className="rsvp-main-phrase">
                    ¡Será un día muy especial para nuestra familia!
                  </p>
                  <h3 className="rsvp-question">¿Nos Acompañarás?</h3>
                  <p className="rsvp-subtext">Por favor confirma tu asistencia</p>

                  {/* Estado actual de confirmación */}
                  {userRSVP !== null && (
                    <div className="rsvp-status-badge">
                      {userRSVP ? (
                        <span className="status-yes">✓ Confirmado: Sí asistiré</span>
                      ) : (
                        <span className="status-no">✗ Confirmado: No podré asistir</span>
                      )}
                    </div>
                  )}

                  {/* Botón de Confirmación */}
                  <button
                    className="rsvp-confirm-btn"
                    onClick={() => setShowRSVPModal(true)}
                  >
                    {userRSVP !== null ? 'Modificar confirmación' : 'Confirmar aquí'}
                  </button>
                </div>
              </div>
            </motion.section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de scroll fijo flotante (aparece después del intro y desaparece al hacer scroll) */}
      <AnimatePresence>
        {!isScrolled && !showIntro && (
          <motion.div
            className="fixed-scroll-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="fixed-scroll-arrow-container"
            >
              <span className="fixed-scroll-label">Desliza para ver</span>
              <span className="fixed-scroll-arrow">↓</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCalendarModal && (
          <motion.div
            className="calendar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCalendarModal(false)}
          >
            <motion.div
              className="calendar-modal-content"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="calendar-modal-title">¿Deseas agregarlo?</h4>
              <div className="calendar-modal-actions">
                <button
                  className="calendar-modal-btn calendar-modal-btn-confirm"
                  onClick={() => {
                    downloadIcs();
                    setShowCalendarModal(false);
                  }}
                >
                  Sí
                </button>
                <button
                  className="calendar-modal-btn calendar-modal-btn-cancel"
                  onClick={() => setShowCalendarModal(false)}
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de asistencia (RSVP) */}
      <AnimatePresence>
        {showRSVPModal && (
          <motion.div
            className="rsvp-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRSVPModal(false)}
          >
            <motion.div
              className="rsvp-modal-content"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="rsvp-modal-title">¿Contamos contigo?</h3>
              <p className="rsvp-modal-description">
                Por favor, indícanos si podrás acompañarnos en este día tan especial.
              </p>
              
              <div className="rsvp-modal-actions">
                <button
                  className="rsvp-modal-btn rsvp-btn-yes"
                  onClick={() => {
                    handleRSVP(true);
                    setShowRSVPModal(false);
                  }}
                >
                  Sí, asistiré
                </button>
                <button
                  className="rsvp-modal-btn rsvp-btn-no"
                  onClick={() => {
                    handleRSVP(false);
                    setShowRSVPModal(false);
                  }}
                >
                  No podré asistir
                </button>
              </div>
              <button
                className="rsvp-modal-close-btn"
                onClick={() => setShowRSVPModal(false)}
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
