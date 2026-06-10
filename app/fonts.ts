import localFont from "next/font/local";
import { Nunito_Sans } from "next/font/google";

export const displayFlyer = localFont({
  src: "./fonts/BrownCasalova.ttf",
  variable: "--font-flyer-display",
  display: "swap",
});

export const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-nunito",
});

export const agilera = localFont({
  src: "./fonts/Agilera.otf",
  variable: "--font-agilera",
  display: "swap",
});
