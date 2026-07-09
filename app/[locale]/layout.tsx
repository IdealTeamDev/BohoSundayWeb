import { displayFlyer, nunito, agilera } from "../fonts";
import SplashScreen from '@/components/splash/SplashScreen';
import WhatsAppButton from '@/components/whatsapp/WhatsAppButton';

import type { Metadata } from "next";
import { Geist, Geist_Mono} from "next/font/google";
import "../globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "en") {
    return {
      title: "Afrobeat party in Medellín | Boho sunday",
      description: "Enjoy Boho Sunday Colombiamoda Edition, an Afrobeat party in Sopetrán held at Casa Candela hotel. Book here.",
      keywords: ["Boho Sunday", "Colombia fashion", "Casa Candela", "Boho party", "Afrobeat party"]
    };
  }

  return {
    title: "Fiesta afrobeat en Medellín | Boho sunday",
    description: "Disfruta el Boho Sunday Colombiamoda Edition, una fiesta de afrobeats en Sopetrán que se realiza en el hotel Casa Candela. Reserva aquí.",
    keywords: ["Boho Sunday", "Colombia moda", "Casa Candela", "Fiesta boho"]
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <html
      lang={locale || "es"}
      className={`${displayFlyer.variable} ${nunito.variable} ${agilera.variable}`}
      suppressHydrationWarning
    >
      <body>
        <SplashScreen />
        <main>{children}</main>
        <WhatsAppButton />
      </body>
    </html>
  );
}
