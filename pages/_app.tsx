import Layout from "@/components/Layout";
import type { AppProps } from "next/app";
import "@/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
