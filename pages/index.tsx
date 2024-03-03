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
      <div className="h-2/3" />
      <div className="pb-24">
        <p className="font-serif text-8xl leading-relaxed mb-12">
          I am a developer and designer who loves the intersection between
          technology and art.
        </p>
        <p className="font-serif text-8xl leading-relaxed mb-12">
          This website is a showcase of just a handful of projects. It also is a
          playground for me to explore new ideas. I love learning about creative
          ways to push technology beyond its design.
        </p>
        <p className="font-serif text-8xl leading-relaxed mb-12 text-pretty">
          While my toolkit is always evolving, it currently includes Typescript,
          React, React Native, Ruby, Rails, GraphQL.
        </p>
      </div>
    </div>
  );
}

{
  /* <div className="text-4xl leading-10 font-light my-12">
        <Link href="/projects">
          <h1 className="font-serif">Projects</h1>
        </Link>
        <ul>
          {allProjects.map((project) => (
            <li className="my-2" key={project.params.id}>
              <Link
                className="font-serif text-2xl capitalize font-medium"
                href={`/projects/${project.params.id}`}
              >
                {project.params.id}
              </Link>
            </li>
          ))}
        </ul>
      </div> */
}
