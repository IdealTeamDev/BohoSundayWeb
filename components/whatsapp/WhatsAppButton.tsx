'use client';

import { useParams } from 'next/navigation';

export default function WhatsAppButton() {
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const tooltipText = locale === 'en' ? 'Chat with us' : 'Chatea con nosotros';

  return (
    <a
      href="https://api.whatsapp.com/send?phone=573233114995"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 lg:bottom-25 right-10 z-[9980] flex items-center justify-center group"
      aria-label="WhatsApp"
    >
      {/* Tooltip */}
      <span className="absolute right-16 bg-[#231E1A] text-[#F4EFE9] text-xs font-nunito font-light px-3 py-1.5 rounded-lg shadow-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
        {tooltipText}
      </span>

      {/* Pulsing Outer Ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping duration-1000 pointer-events-none" />

      {/* Main Button */}
      <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95">
        <svg
          className="w-6 h-6 lg:w-7 lg:h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.473 1.33 4.985l-1.417 5.176 5.302-1.391a9.92 9.92 0 0 0 4.773 1.22c5.506 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.069 14.286c-.249.702-1.442 1.365-1.996 1.449-.49.074-.954.269-3.136-.63-2.628-1.083-4.296-3.766-4.428-3.94-.132-.174-1.077-1.431-1.077-2.729 0-1.298.679-1.936.921-2.197.243-.262.531-.327.708-.327.178 0 .355.002.508.01.161.008.38-.061.595.454.223.534.76 1.856.826 1.992.066.136.111.294.02.476-.091.182-.138.294-.271.454-.134.161-.28.358-.4.481-.132.136-.271.284-.117.549.155.265.688 1.137 1.472 1.834.106.096.792.704 1.488.948.33.116.599.074.778-.116.182-.194.792-.921 1.005-1.236.215-.315.429-.262.723-.153.294.108 1.865.879 2.183 1.038.318.159.53.235.604.364.075.129.075.748-.174 1.45z" />
        </svg>
      </div>
    </a>
  );
}
