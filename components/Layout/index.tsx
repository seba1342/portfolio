import type { Metadata } from "next";

import dynamic from "next/dynamic";
import localFont from "next/font/local";
import Head from "next/head";
import { useRouter } from "next/router";

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
  const { pathname } = useRouter();

  return (
    <div
      className={`${tobias.variable} ${soehne.variable} ${geistMono.variable} flex flex-col text-pretty flex-1 min-h-[100vh] justify-between`}
    >
      <Head>
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />

        <meta content="/share.png" property="og:image" />
        <meta content="image/png" property="og:image:type" />
        <meta content="1238" property="og:image:width" />
        <meta content=" 826" property="og:image:height" />
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/site.webmanifest" rel="manifest" />
      </Head>
      <div className="pb-16">
        <Header />
        <main>{children}</main>
      </div>
      <footer className="p-4 pt-0">
        <Campfire is404={pathname === "/404"} />
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
