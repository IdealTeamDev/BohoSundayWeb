import Link from "next/link";
import { useState, useEffect } from "react";
//revisar el w-90

export const Marquee = () => {

    const eventDate = new Date("2026-07-26T00:00:00");
    
      const [timeLeft, setTimeLeft] = useState({
        dias: 0,
        horas: 0,
        minutos: 0,
        segundos: 0,
      });
    
      useEffect(() => {
        const calcular = () => {
          const ahora = new Date();
          const diferencia = eventDate.getTime() - ahora.getTime();
    
          if (diferencia <= 0) {
            setTimeLeft({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
            return;
          }
    
          setTimeLeft({
            dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
            horas: Math.floor((diferencia / (1000 * 60 * 60)) % 24),
            minutos: Math.floor((diferencia / (1000 * 60)) % 60),
            segundos: Math.floor((diferencia / 1000) % 60),
          });
        };
    
        calcular();
        const interval = setInterval(calcular, 1000);
        return () => clearInterval(interval);
      }, []);
  return (
    <div className="flex w-full bg-[#231E1A] items-center justify-center pt-2  pb-2"> 

        <div className="flex border-b-1 font-bold border-amber-500">
           <div className="flex gap-2 lg:gap-1.5 items-end  text-[#FFB956] text-sm font-bold font-nunito">OPEN DOORS EN: {[
            { valor: timeLeft.dias, label: "D" },
            { valor: timeLeft.horas, label: "H" },
            { valor: timeLeft.minutos, label: "M" },
  
          ].map(({ valor, label }, i, arr) => (
            <div key={label} className="flex items-center gap-1 lg:gap-3">
              <div className="flex flex-row font-bold items-center">
                <span className="text-sm lg:text-1xl font-nunito font-bold">
                  {String(valor).padStart(2, "0")}
                </span>
                <span className="font-nunito font-bold text-sm">{label}</span>
              </div>
            
            </div>
          ))}</div>
           
            
      
        </div>


    </div>
  );
};

