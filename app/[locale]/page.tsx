'use client'

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';
import AlliesCarousel from '@/components/alliesaarousel/AlliesCarousel';
import Parallaxsection from "@/components/parallax/Parallaxsection";
import BottomBar from '@/components/bottombar/BottomBar';
import LineUp from "@/components/lineup/LineUp";
import { Navbar, Editions, PreRegister } from "@/components";
import { Marquee } from "@/components/marquee/Marquee";
import { Footer } from "@/components/footer/Footer";
import BannerVideo from "@/components/bannervideo/BannerVideo";
import BannerEvent from "@/components/bannerevent/BannerEvent";

export default function Home() {
  const [openMap, setOpenMap] = useState(false)
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;
  {/*Se eleimino un pb-28 para eliminar el espacio adicional que se crea cauando se activa el mapa de ventas */ }
  return (

    <div className="flex flex-col flex-1 items-center justify-center bg-[#EAE0CE] font-sans">
      {/* Se oculta el Top Bar (Marquee) por el post Boho */}
      <Marquee />
      <Navbar />
      {/*<div className="w-full">
        <BannerVideo />
      </div>*/}

      <BannerEvent />

      <div className="px-6 md:px-10 mb-10 lg:mb-15 mt-5 text-center max-w-3xl">
        <img
          className="inline-block"
          src="images/icon/icon-palm.png"
          alt="Boho Sunday Colombia Moda Edition"
          width={30}
          height={20}
        />
        {/*<h2 className="text-[#231E1A] text-[28px] md:text-[34px] font-bold font-averia text-center pt-4 pb-6 uppercase tracking-wide">
          {t.home.title}
        </h2>*/}
        <p className="text-black lg:text-[18px] text-[17px]/6 text-center py-2 font-nunito font-light">{t.home.desc1}</p>
        <p className="text-black lg:text-[18px] text-[17px]/6 text-center py-2 font-nunito font-light"><strong>{t.home.desc2}</strong></p>
        
      </div>
      {/*<Editions />*/}
      {/* Se oculta la sección del Line Up por montaje de Boho Sunday */}
      {/*<LineUp />*/}
      {/* Se oculta la sección de Parallax (cuenta regresiva) por montaje de Boho Sunday */}
      <Parallaxsection /> 
      {/* Se oculta hasta el reinicio del Boho*/}
      {/*<PreRegister t={t.preregister} />*/}

      <div className="grid grid-cols-1 lg:grid-cols-3 justify-items-center items-center gap-10 py-10 lg:min-h-[450px] w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 lg:px-0 mb-5">
        <div className="flex lg:col-span-2 justify-center w-full h-[350px] lg:h-[400px] rounded-2xl shadow-sm overflow-hidden relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1268.373964937057!2d-75.74896495177441!3d6.481067132007407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e45cb91916f8017%3A0x5ee4e4528ea7467b!2sHotel%20Casa%20Candela!5e1!3m2!1ses-419!2sco!4v1786471304660!5m2!1ses-419!2sco"
            className="w-full h-[395px] lg:h-[445px] -mb-[45px] pointer-events-auto"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
 
        <div className="flex flex-col lg:col-span-1 items-center justify-center px-7 py-4 lg:py-0 text-center  h-full select-none">
          <span className="text-[#231E1A] text-sm font-nunito font-light">{t.home.location}</span>
          <h2 className="text-[#231E1A] text-[26px] lg:text-[28px] font-bold font-averia uppercase tracking-wide mt-1 mb-3">
            {t.hero.place}
          </h2>
          <div className="text-[#231E1A] text-[17px]/6 font-nunito font-light max-w-xs flex flex-col items-center lg:items-end text-center">
            <span>{t.home.address}</span>
          </div>
        </div>
      </div>
      <AlliesCarousel />

      {/* BottomBar contiene el mapa internamente */}
        
      <BottomBar
        openMap={openMap}
        onToggleMap={() => setOpenMap(!openMap)}
      />*
      <Footer />
    </div>
  );
}