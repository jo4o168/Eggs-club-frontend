import type { Metadata } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "@/index.css";
import { Providers } from "./providers";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Egg's Club | Ovos frescos",
  description: "Plataforma de assinaturas de ovos",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${nunitoSans.variable}`} suppressHydrationWarning>
      <body className={nunitoSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
