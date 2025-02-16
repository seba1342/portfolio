import type { Metadata } from "next";

import { GeistMono } from "geist/font/mono";
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
      className={`${tobias.variable} ${soehne.variable} ${GeistMono.variable} pb-24 min-h-[100vh] flex flex-col text-pretty flex-1`}
    >
      <Head>
        <link href="/favicon.ico" rel="icon" />
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />
      </Head>
      <Header />
      <main>{children}</main>
    </div>
  );
}
