'use client'

export const Footer = () => {
  return (
    <footer className="w-full bg-[url(/images/background/background-footer.png)] bg-cover bg-no-repeat px-6">

      {/* ── Contenido principal ── */}
      <div className="
        flex flex-col
        lg:flex-row lg:items-start lg:justify-center lg:gap-0
        lg:max-w-8xl lg:py-5
      ">

        {/* Contacto */}
        <div className="lg:flex lg:basis-200">  
          <div className="text-[#D9D1C0] pb-4 pt-8 font-nunito font-extralight border-b lg:border-b-0 lg:border-r lg:border-[#D9D1C0]/30 lg:pr-5 lg:pl-0 lg:py-5">
            <p className="uppercase mb-3 text-xl font-extralight">Contacto</p>
            <p className="text-lg mb-2">323 3114995</p>
            <p className="text-lg underline">info@casacandela.co</p>
          </div>

          {/* Legal */}
          <div className="text-[#D9D1C0] py-4 font-nunito border-b lg:border-b-0 lg:px-6 lg:py-5">
            <p className="uppercase text-xl font-extralight mb-3">Legal</p>
            <a href="/policy"><p className=" mb-2 text-lg font-extralight underline">Política de reservas</p></a>
          </div>
        </div>
        {/* Redes sociales */}
        <div className="lg:pl-16 lg:py-10">
          <div className="flex justify-center lg:justify-start mb-6 mt-3 gap-4">
            <a href="https://www.instagram.com/casacandela.co?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="><img
              src="images/icon/icon-instagram.png"
              alt="Instagram"
              width={40}
              height={40}
            /></a>
            <a href="https://www.facebook.com/share/1GYdu2BTDT/">
              <img
                src="images/icon/icon-facebook.png"
                alt="Facebook"
                width={40}
                height={40}
              />
              </a>
          </div>
        </div>

      </div>
{/* ── Copyright ── */}
      <div className="border-t border-[#D9D1C0]/30 lg:max-w-6xl lg:mx-auto">
        <p className="font-nunito text-center text-[#D9D1C0] py-4 text-sm">
          2026 Casa Candela. Todos los derechos reservados.
        </p>
      </div>
      

    </footer>
  );
};
