import type { Metadata } from "next";
import { Sacramento, DM_Serif_Display, Space_Mono, Work_Sans } from "next/font/google";
import "./globals.css";

const sacramento = Sacramento({
  variable: "--font-sacramento",
  weight: "400",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Lazy VA OS — Le cockpit des assistantes virtuelles",
  description:
    "Clients, missions, chrono, rapports d'activité et factures : le cockpit d'opérations des assistantes virtuelles indépendantes.",
};

export default function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sacramento.variable} ${dmSerif.variable} ${spaceMono.variable} ${workSans.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        {children}
        {auth}
      </body>
    </html>
  );
}
