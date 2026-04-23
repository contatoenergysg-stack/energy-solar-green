import type { Metadata } from "next";
import { Lexend, Noto_Serif, Public_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ESG — Energy Solar Green | Energia solar por assinatura",
  description:
    "Economize até 20% na conta de luz com energia renovável gerada em nossas usinas solares. Sem obras, sem investimento. Comece em minutos.",
  metadataBase: new URL("https://energysolargreen.com.br"),
  openGraph: {
    title: "ESG — Energia solar por assinatura",
    description:
      "Energia limpa, inteligente e mais barata. Associe-se e economize.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lexend.variable} ${notoSerif.variable} ${publicSans.variable} ${playfair.variable} antialiased`}
    >
      <body className="min-h-screen bg-tertiary text-neutral font-body">
        {children}
      </body>
    </html>
  );
}
