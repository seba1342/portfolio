import { type Project, getAllProjectIds, getProjectData } from "@/lib/projects";
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
        className={`h-2/3 flex flex-1 w-[calc(110%)] flex-col justify-between pb-8 ${
          !isFirst ? "pt-12" : ""
        }`}
      >
        <h1 className="text-8xl">{project.title}</h1>
        <p className="font-mono text-base">
          {project.type} • {project.date}
        </p>
      </div>
      {!isLast && <div className="w-[110%] h-[1px] -ml-6 bg-bark" />}
    </Link>
  );
}
