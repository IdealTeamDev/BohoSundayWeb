// components/splash/SplashScreen.tsx
'use client';

import { useEffect, useState } from 'react';

// 👇 Ajusta estos dos valores a tu gusto
const SPLASH_DURATION = 3000; // tiempo visible (ms) -> 3 segundos, ahi le pongo mas o menos
const FADE_DURATION = 600;    // duración del fade-out (ms)

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Bloquea el scroll mientras el splash está activo
    document.body.style.overflow = 'hidden';

    // 1) Tras X segundos, empieza el fade-out
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, SPLASH_DURATION);

    // 2) Cuando termina el fade, lo desmontamos del DOM
    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, SPLASH_DURATION + FADE_DURATION);

    // Limpieza para evitar memory leaks
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F4EFE9] transition-opacity ease-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_DURATION}ms` }}
    >
      {/* Uso <img> normal y NO next/image: next/image suele romper/congelar GIFs animados */}
      <img
        src="/images/GIF/logo-boho.gif"
        alt="Cargando Boho Sunday..."
        className="w-full h-full object-contain"
      />
    </div>
  );
}