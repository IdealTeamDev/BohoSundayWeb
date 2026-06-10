'use client'

import Image from "next/image";
import {useState} from 'react';
import EventMap from '@/components/eventmap/EventMap';
import Parallaxsection from "@/components/parallax/Parallaxsection";



export default function Home() {
  const [openMap, setOpenMap] = useState(false)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-[#F4EFE9] font-sans">
      <div className="bg-[url(/images/background/background-home.png)] bg-cover bg-no-repeat flex flex-1 w-full max-w-3xl flex-col items-center justify-between pt-32 pb-16 px-16 dark:bg-red sm:items-start">
        <img
          src="images/logo/logo-boho-colombiamoda.png"
          alt="Boho Sunday Colombia Moda Edition"
          width={180}
          height={20}
        />

        <div className="flex items-center mt-10 mb-5 text-center sm:items-start sm:text-left">
          <div className="flex-1 ">

            <span className="font-displayFlyer text-2xl">26<br></br>Julio</span>

          </div>
          <div className="flex-1 mx-10">

            <img
            src="images/icon/icon-01.png"
           alt="Boho Sunday Colombia Moda Edition"
           width={20}
            height={20}
               />

          </div>
          <div className="flex-1 ">

            <span className="font-displayFlyer text-2xl">46<br></br> Julio</span>

          </div>
        </div>
        <div className="mt-20">
          <img
          src="images/logo/logo-casa-candela.png"
          alt="Boho Sunday Colombia Moda Edition"
          width={220}
          height={20}
          />
        </div>
        
      </div>
      <div className="flex flex-row items-center justify-center gap-4 pt-6 pb-1">

        <button onClick={()=> setOpenMap(true)} className=" text-sm bg-[#686A54] py-2 px-4 rounded-lg my-2">MAPA DE MESAS</button>
        <button className=" text-sm bg-[#686A54] py-2 px-4 rounded-lg my-2">BOLETERIA INDIVIDUAL</button>
      </div>
      {/* Este bloque tiene que estar DENTRO del return también */}
      {openMap && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center overflow-y-auto">
          <div className="w-full max-w-2xl p-4">
            <EventMap onClose={() => setOpenMap(false)} />
          </div>
        </div>
      )}
        
      

      <div>
        <p className="text-black text-center px-4 py-8">Plan de domingo: Boho Sunday Colombiamoda Edition.<br></br>
          Una experiencia llena de moda,  música, diversión y los pequeños detalles  crean buena energía.<br></br> 
          No te pierdas la oportunidad de formar parte de la mejor fiesta de Sopetrán.
        </p>
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
    </div>

  );
}
