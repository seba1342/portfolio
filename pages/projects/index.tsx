import { Mono } from "@/components/text/Mono";
import { Titles } from "@/components/text/Titles";
import { getAllProjectIds, getProjectData, type Project } from "@/lib/projects";
import type { InferGetStaticPropsType } from "next";
import Link from "next/link";

export async function getStaticProps() {
  const allProjectIds = getAllProjectIds();
  const allProjects = allProjectIds.map((id) => getProjectData(id));
  return { props: { allProjects } };
}

export default function Projects({
  allProjects,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="h-full">
      {allProjects.map((project, index) =>
        project != null ? (
          <Project
            isFirst={index === 0}
            isLast={index === allProjects.length - 1}
            key={project.title}
            project={project}
          />
        ) : null
      )}
    </div>
  );
}

function Project({
  isFirst,
  isLast,
  project,
}: {
  isFirst: boolean;
  isLast: boolean;
  project: Project;
}) {
  if (project == null) return;

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        className={`flex flex-1 w-full flex-col justify-between pb-8 relative overflow-hidden ${
          !isFirst ? "pt-12" : ""
        } hover:py-24 transition-all duration-300`}
      >
        <Titles.H1>{project.title}</Titles.H1>
        <Mono.Body>
          {project.type} • {project.date}
        </Mono.Body>
      </div>
      {!isLast && (
        <div className="w-[calc(100%+3rem)] h-[1px] -ml-[1.5rem] bg-bark" />
      )}
    </Link>
  );
}
