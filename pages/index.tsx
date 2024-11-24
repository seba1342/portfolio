// import Projects from "@/components/Projects";
import { Titles } from "@/components/text";

export default function Home() {
  return (
    <>
      <div className="flex flex-col max-w-7xl min-h-full justify-end md:pt-24">
        <Titles.H1>
          I use code to build engaging interactions and experiences. I love the
          crossover between design and computing.
        </Titles.H1>
        <Titles.H3>
          While my toolbox is always evolving, it currently includes Typescript,
          React, React Native, Ruby, Rails, GraphQL.
        </Titles.H3>
      </div>
      {/* <Projects>
        <Projects.Project />
      </Projects> */}
    </>
  );
}
