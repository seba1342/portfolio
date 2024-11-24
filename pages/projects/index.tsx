import type { InferGetStaticPropsType } from "next";

import { Body, Titles } from "@/components/text";
import { type Project, getAllProjectIds, getProjectData } from "@/lib/projects";
import Link from "next/link";
import { useState } from "react";

import HiFiSVG from "./svg/HiFiSVG";

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
  const [isHovered, setIsHovered] = useState(false);
  if (project == null) return;

  return (
    <Link
      href={`/projects/${project.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex flex-1 w-full flex-col justify-between pb-8 relative overflow-hidden ${
          !isFirst ? "pt-12" : ""
        } hover:py-24 transition-all duration-300`}
      >
        <Titles.H1>{project.title}</Titles.H1>
        <Body.Small>
          {project.type} • {project.date}
        </Body.Small>
        <HiFiSVG
          className={`absolute right-0 top-0 fill-bark scale-50 origin-top-right pt-24 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          } transition-all duration-500`}
        />
      </div>
      {!isLast && (
        <div className="w-[calc(100%+3rem)] h-[1px] -ml-[1.5rem] bg-bark" />
      )}
    </Link>
  );
}
