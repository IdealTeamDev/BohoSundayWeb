'use client';

import { useParams } from 'next/navigation';
import { translations } from '@/data/translations';
import { Navbar } from "@/components";
import { Footer } from "@/components/footer/Footer";
import { Marquee } from "@/components/marquee/Marquee";

export default function PolicyPage() {
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = translations[locale] || translations.es;

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE9] font-sans pb-10">
      <Marquee />
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4 md:px-8 pb-16 w-full">
        <div className="w-full max-w-2xl  rounded-2xl p-6 md:p-10">
          <h1 className="font-displayFlyer text-3xl md:text-4xl text-[#231E1A] text-center leading-tight mb-2">
            {t.policy.title}
          </h1>

          <div className="h-px bg-[#E8E2DA] my-4" />

          <ol className="flex flex-col gap-2.5">
            {t.policy.items.map((policy, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="font-nunito text-[16px] font-bold text-[#231E1A] flex-shrink-0 bg-[#F4EFE9] w-8 h-8 rounded-full flex items-center justify-center">
                  {i + 1}.
                </span>
                <p className="font-nunito text-[16px] text-[#231E1A]  pt-1">
                  {policy}
                </p>
              </li>
            ))}
          </ol>

          <div className="h-px bg-[#E8E2DA] my-4" />
          <div>
            <h2 className="font-nunito font-bold text-[16px] text-[#231E1A]">{t.policy.cancellationTitle}</h2>
            <ul className="list-disc list-outinside pl-8 py-3 text-left font-nunito text-[16px] text-[#231E1A]">
              <li>{t.policy.cancellationText}</li>
            </ul>
            <h2 className="font-nunito font-bold text-[16px] text-[#231E1A]">{t.policy.securityTitle}</h2>
            <ol className="flex flex-col gap-2.5 py-3">
              {t.policy.securityItems.map((policy, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="font-nunito text-[16px] font-bold text-[#231E1A] flex-shrink-0 bg-[#F4EFE9] w-8 h-8 rounded-full flex items-center justify-center">
                    {i + 1}.
                  </span>
                  <p className="font-nunito text-[16px] text-[#231E1A]  pt-1">
                    {policy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="text-center">
            <p className="font-nunito font-bold text-[17px] pt-3 text-[#CF6E19]">
              {t.policy.warning}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
