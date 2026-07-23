import type { Metadata } from "next";
import { Bowlby_One, Instrument_Sans } from "next/font/google";
import "./globals.css";

// Typo DA (design/DESIGN.md §2) : Bowlby One en display (H1, timer, logo
// uniquement), Instrument Sans pour tout le reste.
const bowlbyOne = Bowlby_One({
  variable: "--font-bowlby-one",
  weight: "400",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VA Desk — Logiciel de gestion pour assistantes virtuelles",
  description:
    "Gestion des clients, suivi du temps, rapports d'activité et facturation : VA Desk rassemble tout le business des assistantes virtuelles indépendantes au même endroit.",
};

export default function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bowlbyOne.variable} ${instrumentSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        {children}
        {auth}
      </body>
    </html>
  );
}
