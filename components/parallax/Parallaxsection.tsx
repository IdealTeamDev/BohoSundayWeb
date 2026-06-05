"use client";
import { useState, useEffect } from "react";

export default function ParallaxSection() {

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
    <section
      className=" w-full bg-fixed bg-center bg-cover flex items-center justify-center py-8"
      style={{
        backgroundImage: "url('/images/background/background-parallax.png')",
      }}
    >
      <div className="text-white text-center">
        <h2 className="text-sm tracking-widest mb-6">FALTA PARA EL BOHO</h2>
        <div className="flex gap-3 items-end">
          {[
            { valor: timeLeft.dias, label: "Días" },
            { valor: timeLeft.horas, label: "Horas" },
            { valor: timeLeft.minutos, label: "Minutos" },
            { valor: timeLeft.segundos, label: "Segundos" },
          ].map(({ valor, label }, i, arr) => (
            <div key={label} className="flex items-end gap-4">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-displayFlyer">
                  {String(valor).padStart(2, "0")}
                </span>
                <span className="text-xs mt-1">{label}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="font-displayFlyer text-md mb-6">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}