'use client';

interface CountdownTimerProps {
  seconds: number;
  ticketName: string;
}

export default function CountdownTimer({ seconds, ticketName }: CountdownTimerProps) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 120; // red under 2 min

  return (
    <div
      className={`w-full px-4 py-9 flex items-center justify-center
        ${isUrgent ? 'bg-red-50' : 'bg-[#EBCB9D]'}`}
    >
      <div className="items-center justify-between text-center">
        <p className={`font-nunito font-bold text-[18px] uppercase
          ${isUrgent ? 'text-red-500' : 'text-[#CF6E19]'}`}>
          {isUrgent ? '¡Apúrate!' : '¡MESA ASEGURADA!'}
        </p>
        <p className="font-nunito font-bold text-[18px] text-[#CF6E19]">
          COMPLETA EL PAGO EN  {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </p>
      </div>
      
    </div>
  );
}