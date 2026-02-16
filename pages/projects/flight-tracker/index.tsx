import Button from "@/components/Button";
import FixedBanner from "@/components/FixedBanner";
import Content from "@/components/Layout/Content";
import { Body, Mono, Titles } from "@/components/text";

export const theme = {
  alternateBackgroundColor: "#87CEEB",
  backgroundColor: "#1a3a5c",
};

export default function FlightTracker() {
  return (
    <>
      <div
        className={`flight-tracker__background flex flex-col justify-center items-center h-full pt-36 pb-8 w-full relative`}
      >
        <FixedBanner backgroundColor={theme.backgroundColor}>
          <FixedBanner.Text>
            2025 · Arduino, C++
          </FixedBanner.Text>
        </FixedBanner>
        <Titles.H1 align="center" color="light">
          Flight Tracker
        </Titles.H1>
        <Body.Default align="center" color="light">
          Your eyes in the sky.
        </Body.Default>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 pb-16">
          <Button
            backgroundColor={theme.alternateBackgroundColor}
            href="https://github.com/seba1342/flight-tracker"
          >
            View on GitHub
          </Button>
        </div>
      </div>
      <Content className="pt-12">
        <Titles.H3>
          Flight Tracker is an Arduino project that tracks nearby flights and
          tells you where they&apos;re coming from and going to.
        </Titles.H3>
        <Mono.Default className="w-full text-center py-12">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>
        <Titles.H2 className="pt-8">Tech Stack</Titles.H2>
        <Titles.H3>Arduino &amp; C++</Titles.H3>
        <Body.Default>
          Built on Arduino with C++, the Flight Tracker uses ADS-B signals to
          detect aircraft flying nearby. It processes flight data to identify
          where planes are coming from and where they&apos;re headed.
        </Body.Default>

        <Titles.H2>Features</Titles.H2>
        <Titles.H3>Nearby flight detection</Titles.H3>
        <Body.Default>
          Picks up ADS-B signals from aircraft in your area, giving you
          real-time visibility into what&apos;s flying overhead.
        </Body.Default>

        <Titles.H3>Origin &amp; destination info</Titles.H3>
        <Body.Default>
          For each detected flight, the tracker tells you where the plane is
          coming from and where it&apos;s going.
        </Body.Default>
      </Content>
    </>
  );
}
