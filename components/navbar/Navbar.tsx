'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Determinar si el idioma actual es inglés basándose en la URL
  const isEn = pathname.startsWith('/en/') || pathname === '/en';

  const changeLanguage = (lang: 'es' | 'en') => {
    if (lang === 'es' && isEn) {
      // Remover prefijo /en de la URL
      const newPath = pathname.replace(/^\/en/, '') || '/';
      router.push(newPath);
    } else if (lang === 'en' && !isEn) {
      // Añadir prefijo /en a la URL
      const newPath = `/en${pathname === '/' ? '' : pathname}`;
      router.push(newPath);
    }
  };

  return (
    <nav className="flex fixed top-10 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-[#D9D1C0] bg-opacity-30 px-5 py-5 rounded-xl z-999"> 

        <div className="flex-1 w-35">
            <Link href={isEn ? "/en" : "/"}>
                <img className="w-35 lg:w-55" src="/images/logo/logo-boho.png" alt="Boho Sunday" />
            </Link>
        </div>
        <div className="flex flex-1 w-24 justify-end items-center font-nunito font-semibold">
            <button 
              onClick={() => changeLanguage('es')}
              className={`cursor-pointer transition-colors ${!isEn ? 'text-[#231E1A]' : 'text-[#BDB39B]'} mx-4`}
            >
              ES
            </button> 
            <button 
              onClick={() => changeLanguage('en')}
              className={`cursor-pointer transition-colors ${isEn ? 'text-[#231E1A]' : 'text-[#BDB39B]'}`}
            >
              EN
            </button>
        </div>

    </nav>
  );
};


