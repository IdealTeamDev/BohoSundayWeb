'use client';

import { useState, useEffect } from 'react';

const DESKTOP_VIDEO_URL = 'https://res.cloudinary.com/dow0dxajr/video/upload/f_auto,q_auto/v1789482642/Bannerprincipal_fqjzfp.mp4';
const MOBILE_VIDEO_URL = 'https://res.cloudinary.com/dow0dxajr/video/upload/f_auto,q_auto/v1789482631/Bannerprincipalmovil_bs7vov.mp4';

export default function BannerVideo() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const videoSrc = isMobile ? MOBILE_VIDEO_URL : DESKTOP_VIDEO_URL;

  return (
    <div className="w-full overflow-hidden bg-black">
      {isMobile !== null && (
        <video
          key={isMobile ? 'mobile' : 'desktop'}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          controls={false}
          className="w-full h-auto object-cover"
        />
      )}
    </div>
  );
}

