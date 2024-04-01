import { Titles } from "@/components/text/Titles";
import { getAllProjectIds } from "@/lib/projects";
import type { InferGetStaticPropsType } from "next";

export async function getStaticProps() {
  const allProjects = getAllProjectIds();
  return {
    props: {
      allProjects,
    },
  };
}

export default function Home({
  allProjects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="flex-col h-full">
      <div className="h-1/2 md:h-2/3" />
      <div className="pb-12 md:pb-24">
        <Titles.H1>
          I am a developer and designer who loves the intersection between
          technology and art.
        </Titles.H1>
        <Titles.H1>
          This website is a showcase of just a handful of projects. It also is a
          playground for me to explore new ideas. I love learning about creative
          ways to push technology beyond its design.
        </Titles.H1>
        <Titles.H1>
          While my toolkit is always evolving, it currently includes Typescript,
          React, React Native, Ruby, Rails, GraphQL.
        </Titles.H1>
      </div>
    </div>
  );
}
