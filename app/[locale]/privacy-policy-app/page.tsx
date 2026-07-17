'use client';

import { useParams } from 'next/navigation';
import { Navbar } from "@/components";
import { Footer } from "@/components/footer/Footer";
import { Marquee } from "@/components/marquee/Marquee";

const content = {
  es: {
    title: "Política de Privacidad para Boho Sunday Staff",
    lastUpdated: "Última actualización: 17 de julio de 2026",
    intro1: "Boho Sunday (\"nosotros\", \"nuestro\" o \"nos\") opera la aplicación móvil Boho Sunday Staff (en adelante, la \"Aplicación\"). Esta página le informa sobre nuestras políticas en materia de recopilación, uso y divulgación de datos personales cuando utiliza nuestra Aplicación, así como los derechos que le asisten en relación con dichos datos.",
    intro2: "Esta Aplicación está diseñada para ser una herramienta de uso exclusivo interno para la administración y validación (staff) de eventos de Boho Sunday.",
    intro3: "Al utilizar la Aplicación, usted acepta la recopilación y el uso de información de acuerdo con esta política.",
    sections: [
      {
        number: 1,
        title: "Recopilación y Uso de la Información",
        text: "Recopilamos diferentes tipos de información con diversos fines para proporcionar y mejorar nuestro servicio de gestión de acceso:",
        subsections: [
          {
            subtitle: "A. Datos Personales",
            content: "Para poder utilizar nuestra Aplicación, le solicitaremos que nos proporcione cierta información personal identificable que pueda usarse para contactarlo o identificarlo como miembro del staff. Esta información incluye, pero no se limita a:",
            bullets: [
              "Dirección de correo electrónico: Utilizada exclusivamente para iniciar sesión y validar su identidad como personal autorizado (Staff)."
            ]
          },
          {
            subtitle: "B. Información del Dispositivo y Sesión",
            content: "Recopilamos información específica de su dispositivo móvil para fines de seguridad y control.",
            bullets: [
              "Validación de sesión: Recopilamos información básica del dispositivo (como ID o tokens de sesión) para garantizar la validación de sesión única, evitando accesos simultáneos no autorizados a la misma cuenta del staff."
            ]
          },
          {
            subtitle: "C. Permisos del Dispositivo (Cámara)",
            content: "La Aplicación requiere acceso a la cámara de su dispositivo móvil.",
            bullets: [
              "Propósito del acceso a la cámara: Se utiliza estricta y exclusivamente para escanear los códigos QR de los tickets temporales de los asistentes.",
              "Privacidad de las imágenes: NO grabamos, no tomamos fotografías de los usuarios ni almacenamos las imágenes capturadas. El flujo de video se procesa en tiempo real únicamente para decodificar la información del código QR en el dispositivo."
            ],
            note: "Importante: La Aplicación NO recopila ni rastrea información sobre la ubicación (GPS) del dispositivo."
          }
        ]
      },
      {
        number: 2,
        title: "Cómo Usamos sus Datos",
        text: "Boho Sunday utiliza los datos recopilados para los siguientes fines:",
        bullets: [
          "Proveer y mantener las funcionalidades de la Aplicación (autenticación y gestión de acceso).",
          "Validar que solo el personal autorizado tenga acceso al panel y al escáner de la Aplicación.",
          "Proteger la seguridad del sistema y prevenir fraudes o usos no autorizados de las cuentas de personal."
        ]
      },
      {
        number: 3,
        title: "Seguridad de los Datos",
        text: "La seguridad de sus datos es fundamental para nosotros. Los datos (como su correo electrónico y su sesión) se procesan y transmiten de forma segura.",
        bullets: [
          "Cifrado en tránsito: Toda la comunicación entre la Aplicación y nuestros servidores (incluida la base de datos gestionada mediante Supabase) está cifrada en tránsito mediante el protocolo de seguridad HTTPS."
        ],
        extraText: "Nos esforzamos por utilizar medios comercialmente aceptables para proteger su información personal, pero recuerde que ningún método de transmisión por Internet o método de almacenamiento electrónico es 100% seguro."
      },
      {
        number: 4,
        title: "Retención y Eliminación de Datos",
        text: "Conservaremos su información personal solo durante el tiempo que sea necesario para los fines establecidos en esta Política de Privacidad o mientras mantenga su rol activo dentro del equipo de Boho Sunday.",
        extraText: "Solicitud de eliminación: Como usuario (staff), tiene derecho a solicitar la eliminación de sus datos personales. Dado que esta es una herramienta interna, puede gestionar la eliminación de su cuenta y sus datos directamente comunicándose con la administración o a través del contacto provisto en esta política."
      },
      {
        number: 5,
        title: "Divulgación de Datos (Terceros)",
        text: "NO vendemos, intercambiamos ni transferimos de ningún modo su información personal a terceros.",
        extraText: "Los datos solo son compartidos con los proveedores de infraestructura tecnológica estrictamente necesarios para el funcionamiento de la app (como Supabase para la base de datos y autenticación), los cuales están sujetos a estrictos acuerdos de confidencialidad y estándares de seguridad. No incluimos ningún tipo de publicidad (Ads) en la Aplicación, por lo que no hay rastreadores de datos con fines publicitarios."
      },
      {
        number: 6,
        title: "Privacidad Infantil",
        text: "Esta aplicación es una herramienta de uso laboral e interno dirigida al personal de Boho Sunday. Nuestro servicio no está dirigido a personas menores de 18 años (Niños). No recopilamos deliberadamente información de identificación personal de menores de edad."
      },
      {
        number: 7,
        title: "Cambios a esta Política de Privacidad",
        text: "Podemos actualizar nuestra Política de Privacidad periódicamente. Le notificaremos sobre cualquier cambio publicando la nueva Política de Privacidad en esta misma página o, cuando corresponda, a través de una notificación interna. Se le aconseja revisar esta Política periódicamente para detectar cualquier cambio."
      },
      {
        number: 8,
        title: "Contáctenos",
        text: "Si tiene alguna pregunta sobre esta Política de Privacidad o desea ejercer sus derechos sobre sus datos, por favor contáctenos:",
        bullets: [
          "Por correo electrónico: info@casacandela.com",
          "Visitando esta página en nuestro sitio web: https://www.bohosunday.com"
        ]
      }
    ]
  },
  en: {
    title: "Boho Sunday Staff Privacy Policy",
    lastUpdated: "Last updated: July 17, 2026",
    intro1: "Boho Sunday (“we,” “our,” or “us”) operates the Boho Sunday Staff mobile application (hereinafter, the “App”). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our App, as well as your rights in relation to such data.",
    intro2: "This App is designed to be an internal tool exclusively for Boho Sunday event administration and validation (staff).",
    intro3: "By using the App, you agree to the collection and use of information in accordance with this policy.",
    sections: [
      {
        number: 1,
        title: "Information Collection and Use",
        text: "We collect different types of information for various purposes to provide and improve our access management service:",
        subsections: [
          {
            subtitle: "A. Personal Data",
            content: "In order to use our App, we will ask you to provide certain personally identifiable information that can be used to contact you or identify you as a staff member. This information includes, but is not limited to:",
            bullets: [
              "Email address: Used exclusively to log in and validate your identity as authorized personnel (Staff)."
            ]
          },
          {
            subtitle: "B. Device and Session Information",
            content: "We collect specific information from your mobile device for security and control purposes.",
            bullets: [
              "Session validation: We collect basic device information (such as IDs or session tokens) to ensure single-session validation, preventing unauthorized simultaneous access to the same staff account."
            ]
          },
          {
            subtitle: "C. Device Permissions (Camera)",
            content: "The Application requires access to your mobile device's camera.",
            bullets: [
              "Purpose of camera access: It is used strictly and exclusively to scan the QR codes on attendees' temporary tickets.",
              "Image privacy: We do NOT record, photograph, or store captured images. The video stream is processed in real time solely to decode the QR code information on the device."
            ],
            note: "Important: The Application does NOT collect or track device location (GPS) information."
          }
        ]
      },
      {
        number: 2,
        title: "How We Use Your Data",
        text: "Boho Sunday uses the collected data for the following purposes:",
        bullets: [
          "To provide and maintain the App's functionalities (authentication and access management).",
          "To ensure that only authorized personnel have access to the App's dashboard and scanner.",
          "To protect system security and prevent fraud or unauthorized use of staff accounts."
        ]
      },
      {
        number: 3,
        title: "Data Security",
        text: "The security of your data is paramount to us. Data (such as your email address and session) is processed and transmitted securely.",
        bullets: [
          "Encryption in transit: All communication between the App and our servers (including the database managed by Supabase) is encrypted in transit using the HTTPS security protocol."
        ],
        extraText: "We strive to use commercially acceptable means to protect your personal information, but please remember that no method of transmission over the Internet or method of electronic storage is 100% secure."
      },
      {
        number: 4,
        title: "Data Retention and Deletion",
        text: "We will retain your personal information only for as long as necessary for the purposes set out in this Privacy Policy or while you maintain your active role within the Boho Sunday team.",
        extraText: "Deletion Request: As a user (staff), you have the right to request the deletion of your personal data. Since this is an internal tool, you can manage the deletion of your account and data directly by contacting the administration or through the contact information provided in this policy."
      },
      {
        number: 5,
        title: "Data Disclosure (Third Parties)",
        text: "We do NOT sell, trade, or otherwise transfer your personal information to third parties. Data is only shared with the technology infrastructure providers strictly necessary for the app's operation (such as Supabase for the database and authentication), who are subject to strict confidentiality agreements and security standards. We do not include any advertising in the App, so there are no data trackers for advertising purposes."
      },
      {
        number: 6,
        title: "Children's Privacy",
        text: "This application is a work and internal tool intended for Boho Sunday staff. Our service is not directed to individuals under the age of 18 (Children). We do not knowingly collect personally identifiable information from minors."
      },
      {
        number: 7,
        title: "Changes to this Privacy Policy",
        text: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page or, where appropriate, through an internal notification. You are advised to review this Policy periodically for any changes."
      },
      {
        number: 8,
        title: "Contact Us",
        text: "If you have any questions about this Privacy Policy or any other aspect of Boho Sunday, please contact us. To exercise your rights regarding your data, please contact us:",
        bullets: [
          "By email: info@casacandela.com",
          "By visiting this page on our website: https://www.bohosunday.com"
        ]
      }
    ]
  }
};

export default function PrivacyPolicyAppPage() {
  const params = useParams();
  const locale = (params?.locale as 'es' | 'en') || 'es';
  const t = content[locale] || content.es;

  return (
    <div className="flex flex-col min-h-screen bg-[#F4EFE9] font-sans pb-10">
      <Marquee />
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center pt-16 px-4 md:px-8 pb-16 w-full">
        <div className="w-full max-w-2xl rounded-2xl p-6 md:p-10">
          <h1 className="font-displayFlyer text-3xl md:text-4xl text-[#231E1A] text-center leading-tight mb-2">
            {t.title}
          </h1>
          <p className="font-nunito text-[14px] text-gray-500 text-center mb-6">
            {t.lastUpdated}
          </p>

          <div className="h-px bg-[#E8E2DA] my-4" />

          {/* Introducción */}
          <div className="flex flex-col gap-4 mb-8">
            <p className="font-nunito text-[16px] text-[#231E1A] leading-relaxed">
              {t.intro1}
            </p>
            <p className="font-nunito text-[16px] text-[#231E1A] leading-relaxed">
              {t.intro2}
            </p>
            <p className="font-nunito text-[16px] text-[#231E1A] leading-relaxed">
              {t.intro3}
            </p>
          </div>

          {/* Secciones */}
          <div className="flex flex-col gap-8">
            {t.sections.map((section) => (
              <div key={section.number} className="border-t border-[#E8E2DA] pt-6 first:border-0 first:pt-0">
                <h2 className="font-nunito font-bold text-[18px] text-[#231E1A] mb-3 flex gap-3 items-center">
                  <span className="font-nunito text-[15px] font-bold text-[#231E1A] flex-shrink-0 bg-[#E8E2DA] w-8 h-8 rounded-full flex items-center justify-center">
                    {section.number}
                  </span>
                  {section.title}
                </h2>

                <p className="font-nunito text-[16px] text-[#231E1A] leading-relaxed mb-4">
                  {section.text}
                </p>

                {/* Subsecciones (para la Sección 1) */}
                {section.subsections && (
                  <div className="flex flex-col gap-6 pl-4 md:pl-8">
                    {section.subsections.map((sub, sIdx) => (
                      <div key={sIdx}>
                        <h3 className="font-nunito font-bold text-[16px] text-[#231E1A] mb-2">
                          {sub.subtitle}
                        </h3>
                        <p className="font-nunito text-[15px] text-[#231E1A] leading-relaxed mb-2">
                          {sub.content}
                        </p>
                        {sub.bullets && (
                          <ul className="list-disc list-inside pl-4 font-nunito text-[15px] text-[#231E1A] flex flex-col gap-2.5">
                            {sub.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                        {sub.note && (
                          <p className="font-nunito text-[15px] font-semibold text-[#CF6E19] mt-3">
                            {sub.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bullets regulares (para secciones como 2 y 8) */}
                {section.bullets && !section.subsections && (
                  <ul className="list-disc list-inside pl-4 md:pl-8 font-nunito text-[16px] text-[#231E1A] flex flex-col gap-2.5">
                    {section.bullets.map((bullet, bIdx) => {
                      // Hacer clickeable el link si existe en el texto de contacto
                      if (bullet.includes("https://")) {
                        const parts = bullet.split("https://");
                        return (
                          <li key={bIdx} className="leading-relaxed">
                            {parts[0]}
                            <a href={`https://${parts[1]}`} className="underline text-[#CF6E19]" target="_blank" rel="noopener noreferrer">
                              https://{parts[1]}
                            </a>
                          </li>
                        );
                      }
                      if (bullet.includes("mailto:") || bullet.includes("info@casacandela.com")) {
                        return (
                          <li key={bIdx} className="leading-relaxed">
                            {bullet.split("info@casacandela.com")[0]}
                            <a href="mailto:info@casacandela.com" className="underline text-[#CF6E19]">
                              info@casacandela.com
                            </a>
                          </li>
                        );
                      }
                      return (
                        <li key={bIdx} className="leading-relaxed">
                          {bullet}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Texto extra (como en sección 3, 4, 5) */}
                {section.extraText && (
                  <p className="font-nunito text-[16px] text-[#231E1A] leading-relaxed mt-4">
                    {section.extraText}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
