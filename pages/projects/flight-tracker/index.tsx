import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Content from "@/components/Layout/Content";
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

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(1, window.scrollY / window.innerHeight);
      setScrollProgress(progress);

      const contentEl = contentRef.current;
      const titleEl = titleRef.current;
      if (contentEl && titleEl) {
        const contentTop = contentEl.getBoundingClientRect().top;
        const titleBottom = titleEl.getBoundingClientRect().bottom;
        const gap = contentTop - titleBottom;
        const fadeZone = 150;
        setFadeProgress(Math.max(0, Math.min(1, 1 - gap / fadeZone)));
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        <div ref={titleRef} className="sticky top-[calc(50vh-40px)] z-10 flex justify-center pointer-events-none">
          <Titles.H1 spacing="mb-0 text-center">Flight Tracker</Titles.H1>
        </div>
      </div>
      <div ref={contentRef} />
      <Content className="flex flex-col pb-32 pt-4 md:pt-12">
        <Titles.H3 className="text-center">
          A physical device that watches the sky above my house, identifies
          nearby aircraft, and tells me where each flight is coming from and
          going to.
        </Titles.H3>

        <Mono.Default className="w-full text-center py-12">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>

        <Titles.H2>The Idea</Titles.H2>
        <Body.Default>
          I live under a flight path. Planes pass overhead constantly, and I
          found myself wondering where they were all going. Rather than pulling
          out my phone and opening a flight tracking app each time, I wanted
          something physical sitting on my desk that I could glance at or press
          a button to find out.
        </Body.Default>

        <Titles.H2>Hardware</Titles.H2>
        <Titles.H3>Arduino Uno R4 WiFi</Titles.H3>
        <Body.Default>
          The brain of the project is an Arduino Uno R4 WiFi. It handles the
          WiFi connection, API requests, JSON parsing, and drives the LCD
          display. The built-in WiFi module keeps the hardware footprint small,
          no need for a separate networking shield or a Raspberry Pi.
        </Body.Default>

        <Titles.H3>16x2 LCD Display</Titles.H3>
        <Body.Default>
          A standard 16x2 character LCD connected over I2C. It shows a small
          plane ASCII art on idle, and when triggered it scrolls through the
          route information for each flight it finds. For routes longer than 16
          characters it runs a marquee animation, so the full
          origin-to-destination text is always readable.
        </Body.Default>

        <Titles.H3>Physical Button</Titles.H3>
        <Body.Default>
          A single tactile button wired to pin 4. Press it and the device wakes
          up, scans the sky, and starts displaying results. There is something
          satisfying about the interaction being entirely physical. No app to
          open, no screen to unlock.
        </Body.Default>

        {/* Placeholder for hardware photo/video */}
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl bg-softBark/20 flex items-center justify-center my-8">
          <Mono.Default className="opacity-40">[ hardware photo ]</Mono.Default>
        </div>

        <Titles.H2>Software</Titles.H2>
        <Titles.H3>Scanning the Sky</Titles.H3>
        <Body.Default>
          The device defines a geographic bounding box around my house using
          latitude and longitude coordinates. When the button is pressed, it
          queries the FlightRadar24 API for all airborne aircraft within that
          box. The bounding box is configurable, so you could make it as narrow
          as your street or as wide as your suburb.
        </Body.Default>

        <Titles.H3>Flight Identification</Titles.H3>
        <Body.Default>
          Once the boundary scan returns a list of nearby flights, the device
          takes each callsign and runs a second API call to look up the flight
          details. It filters for live flights specifically, pulling out the
          route information, the origin and destination airports. This two-step
          approach means it only fetches detail for planes that are actually in
          the air above you right now.
        </Body.Default>

        <Titles.H3>Display Logic</Titles.H3>
        <Body.Default>
          Results are displayed one flight at a time. The callsign appears on
          the top row, and the route scrolls across the bottom row. Each flight
          gets about 15 seconds of screen time before the next one rotates in.
          After cycling through all detected flights, the display returns to
          idle and the backlight turns off to save power.
        </Body.Default>

        {/* Placeholder for demo video */}
        <div className="w-full h-[300px] md:h-[400px] rounded-2xl bg-softBark/20 flex items-center justify-center my-8">
          <Mono.Default className="opacity-40">[ demo video ]</Mono.Default>
        </div>

        <Titles.H2>Tech Stack</Titles.H2>
        <Body.Default>
          The entire project is a single Arduino sketch. No server, no database,
          no companion app. The device connects directly to WiFi, makes HTTPS
          requests to the FlightRadar24 API via RapidAPI, parses the JSON
          responses on-device, and renders the results to the LCD.
        </Body.Default>
        <Body.Default>
          The simplicity is the point. It is a self-contained object that does
          one thing well. The code is intentionally straightforward so anyone
          with basic Arduino experience could build their own version and
          configure it for their location.
        </Body.Default>
      </Content>
    </>
  );
}
