import type { Metadata } from "next";

import dynamic from "next/dynamic";
import localFont from "next/font/local";
import Head from "next/head";

import Header from "../Header";
import ScrambleOnHover from "../ScrambleOnHover";
import { Mono } from "../text";

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
      className={`${tobias.variable} ${soehne.variable} ${geistMono.variable} flex flex-col text-pretty flex-1 min-h-[100vh] justify-between`}
    >
      <Head>
        <link href="/favicon.ico" rel="icon" />
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />
      </Head>
      <div className="pb-16">
        <Header />
        <main>{children}</main>
      </div>
      <footer className="p-4 pt-0">
        <Campfire />
        <Mono.Default className="text-center w-full">
          Thanks for stopping by xx
          <br className="sm:hidden" />
          <br className="sm:hidden" />
        </Mono.Default>
        <Mono.Default className="text-center w-full">
          If you like code you can see what this website is made of{" "}
          <a
            className="underline underline-offset-2"
            href="https://github.com/seba1342/portfolio"
            target="_blank"
          >
            <ScrambleOnHover>here (Github)</ScrambleOnHover>
          </a>
          .
        </Mono.Default>
      </footer>
    </div>
  );
}
