'use client'

import Image from "next/image";
import {useState} from 'react';
import EventMap from '@/components/eventmap/EventMap';
import AlliesCarousel from '@/components/alliesaarousel/AlliesCarousel';
import Parallaxsection from "@/components/parallax/Parallaxsection";
import { Navbar } from "@/components";



export default function Home() {
  const [openMap, setOpenMap] = useState(false)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#F4EFE9] font-sans">
      <Navbar />
      <div className="bg-[url(/images/background/background-home.png)] bg-cover bg-no-repeat flex flex-1 w-full max-w-3xl flex-col mb-5 items-center justify-between pt-32 pb-16 px-16 dark:bg-red sm:items-start">
        <img
          src="images/logo/logo-boho-colombiamoda.png"
          alt="Boho Sunday Colombia Moda Edition"
          width={180}
          height={20}
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

      {/* Event Map inline container with smooth transition */}
      <div 
        className="w-full max-w-md overflow-hidden transition-all duration-800 ease-in-out px-4"
        style={{
          maxHeight: openMap ? '1500px' : '0px',
          opacity: openMap ? 1 : 0,
          transform: openMap ? 'scale(1)' : 'scale(0.98)',
          marginTop: openMap ? '1.5rem' : '0px',
          marginBottom: openMap ? '1.5rem' : '0px',
        }}
      >
        <EventMap onClose={() => setOpenMap(false)} />
      </div>

      <div className="flex flex-row items-center justify-center gap-4 pb-1">
        <button 
          onClick={()=> setOpenMap(!openMap)} 
          className="text-sm text-[15px] font-semibold font-nunito py-2.5 px-2 rounded-lg my-2 transition-colors duration-300"
          style={{ backgroundColor: openMap ? '#47311F' : '#686A54' }}
        >
          MAPA DE MESAS
        </button>
        <button className=" text-sm bg-[#686A54] text-[15px] font-semibold font-nunito py-2.5 px-2 rounded-lg my-2">BOLETERÍA INDIVIDUAL</button>
      </div>
        
      

      <div className="px-7 mb-6">
        <p className="text-black text-[17px] font-semibold text-center  py-2 font-nunito">Plan de domingo: Boho Sunday Colombiamoda Edition.</p>
        <p className="text-black text-[17px] text-center py-1 font-nunito">Una experiencia llena de moda,  música, diversión y los pequeños detalles  crean buena energía.</p>
        <p className="text-black text-[17px] text-center py-2 font-nunito">No te pierdas la oportunidad de formar parte de <span className="font-semibold">la mejor fiesta de Sopetrán.</span></p>
        
      </div>

      <Parallaxsection/>

      <div className="py-6">

        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.6198796279923!2d-75.73034718782313!3d6.442831024065319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e45cd00070ad22b%3A0x423df42d5961a089!2sCasa%20candela!5e0!3m2!1ses-419!2sco!4v1780683973432!5m2!1ses-419!2sco" width="370"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"/>
      </div>
      <div className="px-7 py-4">
        <p className="text-black text-[17px] font-light text-center font-nunito">LUGAR:</p>
        <p className="text-black text-[17px] text-center font-semibold font-nunito">Casa Candela</p>
        <p className="text-black text-[17px] text-center py-2 px-7 font-nunito">Vereda Tafetanes Ruta 429180 Vía Antigua a Sopetrán, Antioquia</p>
        
      </div>
      <AlliesCarousel />
      
    </div>

  );
}
