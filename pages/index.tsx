import Content from "@/components/Layout/Content";
import Projects from "@/components/Projects";
import { Body, Titles } from "@/components/text";

import gratitudesImage from "./projects/gratitudes/assets/gratitudes.png";

export default function Home() {
  return (
    <Content>
      <div className="flex flex-col  min-h-full justify-end md:pt-24">
        <Titles.H1>
          I use code to build engaging interactions and experiences. I love the
          crossover between design and computing.
        </Titles.H1>
        <Titles.H3>
          While my toolbox is always evolving, it currently includes Typescript,
          React, React Native, Ruby, Rails, GraphQL.
        </Titles.H3>
        <Body.Default className=" font-light">
          Currently building{" "}
          <a
            className="underline underline-offset-4"
            href="https://up.au"
            target="_blank"
          >
            Up
          </a>
          , with an incredible group of people from{" "}
          <a
            className="underline underline-offset-4"
            href="https://ferocia.com.au"
            target="_blank"
          >
            Ferocia
          </a>
          .
        </Body.Default>
      </div>
      <Projects>
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
