import type { Metadata } from "next";
import Head from "next/head";
import localFont from "next/font/local";
import Header from "../Header";

export const tobias = localFont({
  src: "./fonts/Tobias-Thin.woff2",
  display: "swap",
  variable: "--font-tobias",
});

export const soehne = localFont({
  src: "./fonts/Soehne-Book.woff2",
  display: "swap",
  variable: "--font-soehne",
});

export const metadata: Metadata = {
  title: "Sebastien Bailouni",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${tobias.variable} ${soehne.variable}`}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Portfolio" />
        <meta name="og:title" content="Sebastien Bailouni" />
      </Head>
      <Header />
      <main className="flex justify-center text-pretty pt-[calc(113px)]">
        {/* 113px is the height of the header */}
        <div className="h-[calc(100vh-113px)] px-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
