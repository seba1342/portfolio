import type { Metadata } from "next";

import dynamic from "next/dynamic";
import localFont from "next/font/local";
import Head from "next/head";

import Header from "../Header";

const Campfire = dynamic(() => import("../Campfire"), { ssr: false });

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

export const geistMono = localFont({
  display: "swap",
  src: "./fonts/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
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
      className={`${tobias.variable} ${soehne.variable} ${geistMono.variable}`}
    >
      <Head>
        <link href="/favicon.ico" rel="icon" />
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />
      </Head>
      <div className="pb-24 min-h-[85vh] flex flex-col text-pretty flex-1">
        <Header />
        <main>{children}</main>
      </div>
      <Campfire />
    </div>
  );
}
