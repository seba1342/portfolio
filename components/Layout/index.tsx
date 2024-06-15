import type { Metadata } from "next";

import localFont from "next/font/local";
import Head from "next/head";

import Header from "../Header";

export const tobias = localFont({
  display: "swap",
  src: "./fonts/Tobias-Thin.woff2",
  variable: "--font-tobias",
});

export const soehne = localFont({
  display: "swap",
  src: "./fonts/Soehne-Book.woff2",
  variable: "--font-soehne",
});

export const metadata: Metadata = {
  description: "Portfolio",
  title: "Sebastien Bailouni",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${tobias.variable} ${soehne.variable}`}>
      <Head>
        <link href="/favicon.ico" rel="icon" />
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />
      </Head>
      <Header />
      <main className="flex justify-center text-pretty pt-[calc(113px)]">
        {/* 113px is the height of the header */}
        <div className="h-[calc(100vh-113px)] px-6 flex-1">{children}</div>
      </main>
    </div>
  );
}
