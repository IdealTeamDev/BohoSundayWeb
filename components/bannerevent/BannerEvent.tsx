'use client';

import { useState, useEffect, useRef } from 'react';

const DESKTOP_VIDEO_URL =
  'https://res.cloudinary.com/dow0dxajr/video/upload/q_auto,vc_auto,w_1920/v1795723680/BANNER_WEB_jw63qx.mp4';
const MOBILE_VIDEO_URL =
  'https://res.cloudinary.com/dow0dxajr/video/upload/q_auto,vc_auto,w_720/v1795723684/BANNER_MOBILE_gpccha.mp4';

const DESKTOP_POSTER_URL =
  'https://res.cloudinary.com/dow0dxajr/video/upload/f_webp,q_auto,w_1920,so_0/v1795723680/BANNER_WEB_jw63qx.jpg';
const MOBILE_POSTER_URL =
  'https://res.cloudinary.com/dow0dxajr/video/upload/f_webp,q_auto,w_720,so_0/v1795723684/BANNER_MOBILE_gpccha.jpg';

export default function BannerEvent() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isMobile === null) return;

    let unlockCleanup: (() => void) | undefined;

    const startPlayback = async () => {
      try {
        video.muted = false;
        await video.play();
      } catch {
        // Si el navegador bloquea el autoplay con audio al cargar,
        // iniciamos el video en silencio para que no se quede pausado
        // y activamos el sonido apenas el usuario toque o haga clic en la página.
        video.muted = true;
        video.play().catch(() => {});

        const enableAudio = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => {});
          }
          window.removeEventListener('click', enableAudio);
          window.removeEventListener('touchstart', enableAudio);
          window.removeEventListener('keydown', enableAudio);
        };

        window.addEventListener('click', enableAudio, { once: true });
        window.addEventListener('touchstart', enableAudio, { once: true });
        window.addEventListener('keydown', enableAudio, { once: true });

        unlockCleanup = () => {
          window.removeEventListener('click', enableAudio);
          window.removeEventListener('touchstart', enableAudio);
          window.removeEventListener('keydown', enableAudio);
        };
      }
    };

    startPlayback();

    return () => {
      if (unlockCleanup) unlockCleanup();
    };
  }, [isMobile]);

  const videoSrc = isMobile ? MOBILE_VIDEO_URL : DESKTOP_VIDEO_URL;
  const posterSrc = isMobile ? MOBILE_POSTER_URL : DESKTOP_POSTER_URL;

  return (
    <div className="w-full overflow-hidden mb-5">
      {isMobile === null ? (
        <picture>
          <source media="(max-width: 767px)" srcSet={MOBILE_POSTER_URL} />
          <img
            src={DESKTOP_POSTER_URL}
            alt="Boho Sunday White Edition III"
            fetchPriority="high"
            className="w-full h-auto object-cover block aspect-[4/5] md:aspect-video"
          />
        </picture>
      ) : (
        <video
          ref={videoRef}
          key={isMobile ? 'mobile' : 'desktop'}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          playsInline
          preload="metadata"
          controls={false}
          className="w-full h-auto object-cover block aspect-[4/5] md:aspect-video"
        />
      )}
    </div>
  );
}
