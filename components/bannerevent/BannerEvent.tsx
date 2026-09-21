'use client';

const DESKTOP_BANNER_URL = 'https://res.cloudinary.com/dow0dxajr/image/upload/v1789753269/hero_5_1_qarfv8.webp';
const UNIFIED_LOGO_URL = 'https://res.cloudinary.com/dow0dxajr/image/upload/v1790000932/logo_boho-logo_cc-dates_1_y9tv2t.webp';

export default function BannerEvent() {
  return (
    <div
      style={{ backgroundImage: `url(${DESKTOP_BANNER_URL})` }}
      className="bg-cover bg-center bg-no-repeat flex flex-1 w-full flex-col mb-5 items-center justify-center pt-28 pb-16 px-6 md:px-16"
    >
      <div className="flex flex-col items-center justify-center w-full max-w-4xl">
        <img
          src={UNIFIED_LOGO_URL}
          alt="Boho Sunday Colombia Moda Edition - Casa Candela"
          className="w-full max-w-[600px] md:max-w-[700px] xl:max-w-[800px] h-auto object-contain pointer-events-none drop-shadow-sm"
        />
      </div>
    </div>
  );
}