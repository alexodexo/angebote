import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Angebote.KI - Von Sprache zu professionellem Angebot",
  description: "Erstelle professionelle Angebote in Minuten mit KI-Technologie. Von Audio zu fertigem PDF.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gradient-to-br from-gray-50 via-white to-blue-50`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
