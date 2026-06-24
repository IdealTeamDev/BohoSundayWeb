'use client';

import { Navbar } from "@/components";
import { Footer } from "@/components/footer/Footer";
import { Marquee } from "@/components/marquee/Marquee";

const POLICIES = [
  'La edad mínima para ingresar es de 18 años. ¡Un parche pensado solo para adultos!',
  'Las mascotas no están permitidas. Lo sentimos, peluditos...',
  'Cuida tus pertenencias: no nos hacemos responsables por pérdidas o extravíos.',
  'Nos esforzamos por ofrecer un ambiente de calidad y confort, pero no asumimos responsabilidad por daños a objetos personales (ropa, accesorios u otros artículos).',
  'Nuestro hotel es un espacio libre de humo. ¡Recuerda que tenemos techos de paja y tu seguridad es prioridad!',
  'No está permitido el ingreso de alimentos y bebidas externas. ¡Despreocúpate, nuestra carta tiene opciones deliciosas!',
  'El uso, posesión o distribución de drogas está estrictamente prohibido. Nos comprometemos a mantener un ambiente seguro y respetuoso.',
  'Esperamos siempre un comportamiento respetuoso en las áreas comunes. No aceptamos actos obscenos, indecentes o inapropiados.',
  'Rechazamos el turismo sexual y cualquier forma de explotación. No se permiten actividades ilegales relacionadas con prostitución o tráfico sexual; quienes incumplan serán denunciados a las autoridades.'
];

const SEGURIDAD = [
  'En Casa Candela no nos hacemos responsables por fraudes cometidos a través de terceros o plataformas no oficiales.',
  'Realiza siempre tus reservas en nuestros canales oficiales: Línea directa: 323 311 4995.',
  'El huésped asume total responsabilidad al entregar pagos o información personal a fuentes no autorizadas.'
];

export default function PolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE9] font-sans pb-10">
      <Marquee />
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4 md:px-8 pb-16 w-full">
        <div className="w-full max-w-2xl  rounded-2xl p-6 md:p-10">
          <h1 className="font-displayFlyer text-3xl md:text-4xl text-[#231E1A] text-center leading-tight mb-2">
            Políticas de Reserva
          </h1>

          <div className="h-px bg-[#E8E2DA] my-4" />

          <ol className="flex flex-col gap-2.5">
            {POLICIES.map((policy, i) => (
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
            <h2 className="font-nunito font-bold text-[16px] text-[#231E1A]">Políticas de Cancelación</h2>
            <ul className="list-disc list-outinside pl-8 py-3 text-left font-nunito text-[16px] text-[#231E1A]">
            <li>Todas las compras son finales. En caso de cancelación por parte del cliente, no aplica devolución del dinero ni reembolso total o parcial.</li>
            </ul>
            <h2 className="font-nunito font-bold text-[16px] text-[#231E1A]">Reservas y Seguridad</h2>
            <ol className="flex flex-col gap-2.5 py-3">
            {SEGURIDAD.map((policy, i) => (
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
              Ten en cuenta que las Camas fueron creadas para disfrutarse entre amigos, en grupos mixtos (hombres y mujeres), y compartir juntos la mejor energía Boho.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
