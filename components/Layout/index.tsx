import type { Metadata } from "next";

import localFont from "next/font/local";
import Head from "next/head";

import Header from "../Header";

export const tobias = localFont({
  display: "swap",
  src: "./fonts/Tobias-Light.woff2",
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
    <div
      className={`${tobias.variable} ${soehne.variable} pb-24 min-h-[100vh]`}
    >
      <Head>
        <link href="/favicon.ico" rel="icon" />
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />
      </Head>
      <Header />
      <main
        className={`flex flex-col justify-center text-pretty px-2 md:px-6 flex-1 pt-[80px]`}
      >
        {children}
      </main>
    </div>
  );
}
