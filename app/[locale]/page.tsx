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

export default function Home() {
  const [openMap, setOpenMap] = useState(false)
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;
  {/*Se eleimino un pb-28 para eliminar el espacio adicional que se crea cauando se activa el mapa de ventas */ }
  return (

    <div className="flex flex-col flex-1 items-center justify-center bg-[#F4EFE9] font-sans">
      {/* Se oculta el Top Bar (Marquee) por el post Boho */}
      {/* <Marquee /> */}
      <Navbar />
      <div className="w-full">
        <BannerVideo />
      </div>

      {/* <div className="bg-[url(/images/background/background-home.png)] lg:bg-[url(/images/background/background-desktop-home.png)] bg-cover bg-no-repeat flex flex-1 w-full flex-col mb-5 items-center justify-between pt-32 pb-16 px-16 dark:bg-red">
        
        <div className="flex flex-col items-center justify-center lg:hidden w-full">
          <img
            src={t.home.logoBoho}
            alt="Boho Sunday Colombia Moda Edition"
            className="block sm:hidden w-50"        
            />
          <img
            src={t.home.logoBohoDesk}
            alt="Boho Sunday"
            className="hidden sm:block sm:w-80"
          />

          <div className="flex items-center mt-10 mb-2 text-center sm:items-start sm:text-left">
            <div className="flex flex-col">
              <span className="font-agilera text-xl">JUL</span>
              <span className="font-agilera text-4xl">26</span>
            </div>
            <div className="flex-1 mx-10">
              <img
                src="images/icon/icon-01.png"
                alt="Boho Sunday Colombia Moda Edition"
                width={20}
                height={20}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-agilera text-4xl">10</span>
              <span className="font-agilera text-xl">AM</span>
            </div>
          </div>

          <div className="mt-10">
            <img
              src="images/logo/logo-casa-candela.png"
              alt="Boho Sunday Colombia Moda Edition"
              width={220}
              height={20}
            />
          </div>
        </div> 

        
        <div className="hidden lg:flex flex-col items-center justify-center w-full max-w-6xl">
          <div className="flex flex-row items-center justify-center gap-12 xl:gap-20 w-full mb-10">
            
            <div className="flex flex-col items-center text-center text-[#F4EFE9] select-none">
              <span className="font-agilera text-4xl xl:text-5xl leading-none">JUL</span>
              <span className="font-agilera text-8xl xl:text-8xl leading-none mt-2">26</span>
            </div>

           
            <div className="flex justify-center mx-4">
              <img
                src={t.home.logoBohoDesk}
                alt="Boho Sunday"
                className="w-[400px] xl:w-[450px]"
              />
            </div>

           
            <div className="flex flex-col items-center text-center text-[#F4EFE9] select-none">
              <span className="font-agilera text-8xl xl:text-8xl leading-none">10</span>
              <span className="font-agilera text-4xl xl:text-5xl leading-none mt-2">AM</span>
            </div>
          </div>

          
          <div>
            <img
              src="images/logo/logo-casa-candela.png"
              alt="Boho Sunday Colombia Moda Edition"
              
              width={280}
              height={25}
            />
          </div>
        </div>
      </div> */}

      <div className="px-6 md:px-10 mb-10 lg:mb-15 mt-5 text-center max-w-3xl">
        <img
          className="inline-block"
          src="images/icon/icon-palm.png"
          alt="Boho Sunday Colombia Moda Edition"
          width={30}
          height={20}
        />
        <h2 className="text-[#231E1A] text-[28px] md:text-[34px] font-bold font-averia text-center pt-4 pb-6 uppercase tracking-wide">
          {t.home.title}
        </h2>
        <p className="text-black lg:text-[18px] text-[17px]/6 text-center py-2 font-nunito font-light">{t.home.desc1}</p>
        <p className="text-black lg:text-[18px] text-[17px]/6 text-center py-2 font-nunito font-light">{t.home.desc2}</p>
        <p className="text-black lg:text-[18px] text-[17px]/6 text-center py-2 font-nunito font-light">{t.home.desc3}</p>
      </div>
      <Editions />
      {/* Se oculta la sección del Line Up por montaje de Boho Sunday */}
      {/* <LineUp /> */}
      {/* Se oculta la sección de Parallax (cuenta regresiva) por montaje de Boho Sunday */}
      {/* <Parallaxsection /> */}
      
      <PreRegister t={t.preregister} />

      <div className="grid grid-cols-1 lg:grid-cols-3 justify-items-center items-center gap-10 py-10 lg:min-h-[450px] w-full lg:w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 lg:px-0 mb-5">
        <div className="flex lg:col-span-2 justify-center w-full h-full">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1268.373964937057!2d-75.74896495177441!3d6.481067132007407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e45cb91916f8017%3A0x5ee4e4528ea7467b!2sHotel%20Casa%20Candela!5e1!3m2!1ses-419!2sco!4v1786471304660!5m2!1ses-419!2sco"
            className="w-full h-[350px] lg:h-[400px] rounded-2xl shadow-sm"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
 
        <div className="flex flex-col lg:col-span-1 items-center lg:items-end justify-center px-7 py-4 lg:py-0 text-center lg:text-right h-full select-none">
          <span className="text-[#231E1A] text-sm font-nunito font-light">{t.home.location}</span>
          <h2 className="text-[#231E1A] text-[26px] lg:text-[30px] font-bold font-averia uppercase tracking-wide mt-1 mb-3">
            {t.hero.place}
          </h2>
          <div className="text-[#231E1A] text-[15px]/6 font-nunito font-light max-w-xs flex flex-col items-center lg:items-end">
            <span>Vereda Tafetanes Ruta 429180</span>
            <span>Vía Antigua a Sopetrán, Antioquia</span>
          </div>
        </div>
      </div>
      <AlliesCarousel />

      {/* BottomBar contiene el mapa internamente */}
      {/* Activar para el proximo Boho 
      <BottomBar
        openMap={openMap}
        onToggleMap={() => setOpenMap(!openMap)}
      />*/}
      <Footer />
    </div>
  );
}