import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

// Fontes de marque VA Desk (D14) : BOWL (display) et Aileron (body) seront
// chargées ici en next/font/local (variables --font-bowl / --font-aileron)
// dès que les fichiers seront dans src/fonts/ — d'ici là, globals.css
// retombe sur les fallbacks système.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
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
    <html lang="fr" className={spaceMono.variable}>
      <body className="flex min-h-screen flex-col">
        {children}
        {auth}
      </body>
    </html>
  );
}
