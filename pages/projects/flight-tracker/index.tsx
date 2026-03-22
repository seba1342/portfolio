import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Content from "@/components/Layout/Content";
import { Titles } from "@/components/text";

const VolumetricClouds = dynamic(
  () => import("@/components/VolumetricClouds"),
  { ssr: false },
);

export default function FlightTracker() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / window.innerHeight);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <VolumetricClouds className="w-full h-full" scrollProgress={scrollProgress} />
      </div>
      <div className="fixed inset-x-0 top-0 z-10 flex items-start justify-center pt-24 pointer-events-none">
        <Titles.H1>Flight Tracker</Titles.H1>
      </div>
      <div className="h-screen" />
      <Content className="flex flex-col gap-4 items-center min-h-screen py-32">
        <Titles.H1>Flight Tracker</Titles.H1>
      </Content>
    </>
  );
}
