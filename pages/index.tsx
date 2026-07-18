import dynamic from "next/dynamic";
import Content from "@/components/Layout/Content";
import Projects from "@/components/Projects";
import ScrambleOnHover from "@/components/ScrambleOnHover";
import { Body, Titles } from "@/components/text";
import gratitudesImage from "./projects/gratitudes/assets/gratitudes.png";

const VolumetricClouds = dynamic(
  () => import("@/components/VolumetricClouds"),
  { ssr: false },
);

export default function Home() {
  return (
    <Content>
      <div className="flex flex-col  min-h-full justify-end md:pt-24">
        <Titles.H1>
          I use code to build&nbsp;engaging interactions and experiences.
        </Titles.H1>
        <Titles.H3>
          While my toolbox is always evolving, it currently includes Typescript,
          React, React Native, Ruby, Rails, GraphQL.
        </Titles.H3>
        <Body.Default className="font-light">
          I am currently building{" "}
          <a
            className="font-sans sm:font-mono underline underline-offset-2"
            href="https://up.au"
            target="_blank"
          >
            <ScrambleOnHover>Up</ScrambleOnHover>
          </a>
          , with an incredible group of people from{" "}
          <a
            className="font-sans sm:font-mono underline underline-offset-2"
            href="https://ferocia.com.au"
            target="_blank"
          >
            <ScrambleOnHover>Ferocia</ScrambleOnHover>
          </a>
          .
        </Body.Default>
      </div>
      <Projects>
        <Projects.Project
          href="/projects/flight-tracker"
          subtitle="Your eyes in the sky."
          title="Flight Tracker"
        >
          <VolumetricClouds
            className="absolute inset-0 h-full w-full"
            maxFps={24}
            showControls={false}
          />
          <div className="absolute inset-0 border-2 border-bark rounded-2xl z-10 pointer-events-none" />
        </Projects.Project>
        <Projects.Project
          backgroundClass="gratitudes__background"
          href="/projects/gratitudes"
          image={gratitudesImage}
          subtitle="A daily journalling app."
          title="Gratitudes"
        />
      </Projects>
    </Content>
  );
}
