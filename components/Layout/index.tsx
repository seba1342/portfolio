import type { Metadata } from "next";

import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Head from "next/head";

import Header from "../Header";

const Campfire = dynamic(() => import("../Campfire"), { ssr: false });

export const tobias = localFont({
  display: "swap",
  src: "./fonts/Tobias-Light.woff2",
  variable: "--font-tobias",
});

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
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
    <html
      className={`${tobias.variable} ${geist.variable} ${geistMono.variable} flex flex-col text-pretty flex-1 min-h-[100vh] justify-between`}
      lang="en"
    >
      <Head>
        <meta content="Portfolio" name="description" />
        <meta content="Sebastien Bailouni" name="og:title" />

        <meta content="/share.png" property="og:image" />
        <meta content="image/png" property="og:image:type" />
        <meta content="1238" property="og:image:width" />
        <meta content="826" property="og:image:height" />
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
      <body>
        <div className="pb-16">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
