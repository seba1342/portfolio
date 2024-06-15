import type { AppProps } from "next/app";

import Layout from "@/components/Layout";
import "@/globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </Layout>
  );
}
