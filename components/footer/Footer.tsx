'use client'

export const Footer = () => {
  return (
    <footer className="w-full bg-[url(/images/background/background-footer.png)] bg-cover bg-no-repeat px-6 ">

        <div className="text-[#D9D1C0] pb-4 pt-8 font-nunito font-extralight border-b ">
            <p className="uppercase mb-3 text-xl font-extralight">Contacto</p>
            <p className="px-3 text-lg mb-2">323 3114995</p>
            <p className="px-3 text-lg underline">info@casacandela.co</p>
        </div>
        <div className=" text-[#D9D1C0] py-4 font-nunito border-b-1">
            <p className="uppercase text-xl font-extralight mb-3">LEGAL</p>
            <p className="px-3 mb-2 text-lg font-extralight underline">Política de reservas</p>
        </div>
        <div>
          <div className="flex justify-center mb-6 mt-3 gap-4 ">
            <img
            src="images/icon/icon-instagram.png"
            alt="Boho Sunday Colombia Moda Edition"
            width={40}
            height={20}
            />
            <img
            src="images/icon/icon-facebook.png"
            alt="Boho Sunday Colombia Moda Edition"
            width={40}
            height={20}
            />
        </div>
          <p className="px-3 font-nunito text-center text-[#D9D1C0]">2026 Casa Candela</p>
          <p className="px-3 mb-6 font-nunito text-center text-[#D9D1C0]">Todos los derechos reservados</p>
      </div>
    </footer>
  );
};

