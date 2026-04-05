import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Content from "@/components/Layout/Content";
import LcdDisplay from "@/components/LcdDisplay";
import MediaBlock from "@/components/MediaBlock";
import ScrambleOnHover from "@/components/ScrambleOnHover";
import { Body, Mono, Titles } from "@/components/text";

const VolumetricClouds = dynamic(
  () => import("@/components/VolumetricClouds"),
  { ssr: false },
);

export default function FlightTracker() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fadeProgress, setFadeProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const doneRef = useRef(false);
  const animationFrameRef = useRef<null | number>(null);
  const scrollProgressRef = useRef(-1);
  const fadeProgressRef = useRef(-1);

  useEffect(() => {
    const updateScrollState = () => {
      if (doneRef.current) {
        if (window.scrollY < window.innerHeight) doneRef.current = false;
        else {
          animationFrameRef.current = null;
          return;
        }
      }

      const nextScrollProgress = Math.min(1, window.scrollY / window.innerHeight);
      if (nextScrollProgress !== scrollProgressRef.current) {
        scrollProgressRef.current = nextScrollProgress;
        setScrollProgress(nextScrollProgress);
      }

      const contentEl = contentRef.current;
      const titleEl = titleRef.current;
      if (contentEl && titleEl) {
        const contentTop = contentEl.getBoundingClientRect().top;
        const titleBottom = titleEl.getBoundingClientRect().bottom;
        const gap = contentTop - titleBottom;
        const fadeZone = 150;
        const nextFadeProgress = Math.max(0, Math.min(1, 1 - gap / fadeZone));
        if (nextFadeProgress !== fadeProgressRef.current) {
          fadeProgressRef.current = nextFadeProgress;
          setFadeProgress(nextFadeProgress);
        }

        if (nextFadeProgress >= 1) doneRef.current = true;
      }

      animationFrameRef.current = null;
    };

    const onScroll = () => {
      if (animationFrameRef.current != null) return;
      animationFrameRef.current = requestAnimationFrame(updateScrollState);
    };

    updateScrollState();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-10">
        <VolumetricClouds
          className="w-full h-full"
          fadeProgress={fadeProgress}
          scrollProgress={scrollProgress}
        />
      </div>
      <div className="h-[165vh]">
        <div
          className="sticky top-[calc(50vh-40px)] z-10 flex flex-col items-center gap-2"
          ref={titleRef}
        >
          <Titles.H1 spacing="mb-0 text-center">Flight Tracker</Titles.H1>
          <button
            className="cursor-pointer rounded-full bg-oatmeal/30 px-4 py-1 backdrop-blur-md"
            onClick={() =>
              contentRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
            style={{ opacity: Math.max(0, 0.8 - scrollProgress * 8) }}
          >
            <Mono.Default className="opacity-80 transition-opacity duration-300">
              <ScrambleOnHover>Scroll Down ↓</ScrambleOnHover>
            </Mono.Default>
          </button>
        </div>
      </div>
      <div ref={contentRef} />
      <Content className="flex flex-col pb-32 pt-4 md:pt-12">
        <Titles.H3 className="text-center">
          A physical device that helps identify planes that we can see from our
          balcony. Know where they are coming from and where they are going with
          the press of a button.
        </Titles.H3>

        <Mono.Default className="w-full text-center py-6 md:py-24">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>

        <MediaBlock>
          <MediaBlock.Media>
            <video
              autoPlay
              loop
              muted
              playsInline
              src="/videos/flight-tracker-demo.mp4"
            />
          </MediaBlock.Media>
          <MediaBlock.Content>
            <Body.Default spacing="mb-0">
              We live in the perfect spot to view a popular flight path and have
              always wanted to know where certain flights were coming from and
              going to.
            </Body.Default>
            <Body.Default spacing="mb-0">
              I&rsquo;ve always wanted to build something using an Arduino, and
              thought this would be the perfect project to dip my toes in the
              hardware world.
            </Body.Default>
            <Body.Default spacing="mb-0">
              This project is still a work in progress.
            </Body.Default>
          </MediaBlock.Content>
        </MediaBlock>

        <MediaBlock reverse>
          <MediaBlock.Media>
            <Image
              alt="Flight Tracker hardware — Arduino Uno R4 WiFi wired to an LCD display and button on a breadboard"
              className=""
              height={900}
              src="/images/flight-tracker-hardware.jpg"
              width={1200}
            />
          </MediaBlock.Media>
          <MediaBlock.Content>
            <Titles.H3 spacing="mb-0">Hardware</Titles.H3>
            <Body.Default spacing="mb-0">
              This was my first time working with an Arduino. I chose to go with
              the <span className="italic">Arduino Uno R4 WiFi</span>.
              It&rsquo;s a fairly inexpensive chip (~$50 AUD) that can connect
              to the internet with an ethernet cord. I wired it up to a button
              and a simple 2x16 LCD screen to display flight information.
            </Body.Default>
          </MediaBlock.Content>
        </MediaBlock>

        <Titles.H3>Getting Flight Information</Titles.H3>
        <Body.Default>
          To get realtime flight information whenever the button is pressed I
          use the <span className="italic">FlightRadar24 API</span>. By
          providing a certain region to search within I can confidently assume
          that the plane I am looking at is the one that is returned. If there
          are multiple flights available in the searchable region it will rotate
          through all found flights.
        </Body.Default>

        <Body.Default>
          Here is a demo of what the LCD renders (with fake flight data):
        </Body.Default>

        <LcdDisplay />

        <MediaBlock reverse>
          <MediaBlock.Media>
            <video
              controls
              muted
              playsInline
              src="/videos/flight-tracker-hardware.mp4"
            />
          </MediaBlock.Media>
          <MediaBlock.Content>
            <Titles.H3>The Outcome</Titles.H3>
            <Body.Default>
              Here it is in action. The next thing to do for this project is to
              package it up nicely. I think some sort of frame that allows me to
              mount it to a wall somewhere would look nice and make it easily
              accessible to anyone wanting to use it.
            </Body.Default>

            <Body.Default>
              You can find the code that the Arduino is running here:{" "}
              <a
                className="underline"
                href="https://github.com/seba1342/flight-tracker"
              >
                Flight Tracker (GitHub)
              </a>
            </Body.Default>
          </MediaBlock.Content>
        </MediaBlock>
        <Mono.Default className="w-full text-center pt-6 md:pt-24">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>
      </Content>
    </>
  );
}
