'use client'

import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';

export const Footer = () => {
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  return (
    // Se comenta la imagen de fondo anterior: bg-[url(/images/background/background-footer.png)]
    <footer className="w-full bg-[#0E0E0E] px-6 border-t border-[#1C1C1C]">

      {/* ── Contenido principal ── */}
      <div className="
        flex flex-col
        lg:flex-row lg:items-start lg:justify-center lg:gap-0
        lg:max-w-8xl lg:py-5
      ">

        {/* Contacto */}
        <div className="lg:flex lg:basis-200">  
          <div className="text-white pb-4 pt-8 font-nunito font-light border-b lg:border-b-0 lg:border-r lg:border-gray-800 lg:pr-5 lg:pl-0 lg:py-5">
            <p className="uppercase mb-3 text-sm lg:text-base font-light tracking-wider text-[#A5A096]">{t.footer.contact}</p>
            <p className="text-sm lg:text-base mb-2 text-[#EBE6DD]">323 311 4995</p>
            <p className="text-sm lg:text-base underline text-[#EBE6DD]">info@casacandela.co</p>
          </div>

          {/* Legal */}
          <div className="text-white py-4 font-nunito border-b lg:border-b-0 lg:px-6 lg:py-5">
            <p className="uppercase text-sm lg:text-base font-light tracking-wider mb-3 text-[#A5A096]">{t.footer.legal}</p>
            <a href={locale === 'en' ? "/en/policy" : "/policy"}><p className=" mb-2 text-sm lg:text-base font-light underline text-[#EBE6DD]">{t.footer.policy}</p></a>
            <a href={locale === 'en' ? "/en/privacy-policy-app" : "/privacy-policy-app"}><p className=" mb-2 text-sm lg:text-base font-light underline text-[#EBE6DD]">{t.footer.privacyPolicyApp}</p></a>
          </div>
        </div>
        {/* Redes sociales */}
        <div className="lg:pl-16 lg:py-10">
          <div className="flex justify-center lg:justify-start mb-6 mt-3 gap-4">
            <a href="https://www.instagram.com/boho.sunday?igsh=OWR1cjRhcmd3dWRh"><img
              src="/images/icon/icon-instagram.png"
              alt="Instagram"
              width={35}
              height={35}
              className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
            /></a>
            <a href="https://www.facebook.com/share/1GYdu2BTDT/">
              <img
                src="/images/icon/icon-facebook.png"
                alt="Facebook"
                width={35}
                height={35}
                className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
              />
              </a>
          </div>
        </div>

      </div>
{/* ── Copyright ── */}
      <div className="border-t border-gray-800 lg:max-w-6xl lg:mx-auto">
        <p className="font-nunito text-center text-[#8E8A83] py-4 text-xs">
          {t.footer.rights}
        </p>
      </div>
      

    </footer>
  );
};
