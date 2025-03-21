import { Mono, Titles } from "@/components/text";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { ComponentProps } from "react";
import Markdown from "react-markdown";

import { Project, getAllProjectIds, getProjectData } from "../../lib/projects";

type Props = { project: Project };

export const getStaticPaths: GetStaticPaths = () => {
  const paths = getAllProjectIds().map((id) => ({ params: { id } }));
  return {
    fallback: false,
    paths,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const project = getProjectData(params?.id);
  return {
    props: {
      project,
    },
  };
};

const components = {
  a: (props) => <a {...props} className={`${props.className} underline`} />,
  h1: (props) => <Titles.H1>{props.children}</Titles.H1>,
  h2: (props) => <Titles.H2>{props.children}</Titles.H2>,
  p: (props) => <p {...props} className={`${props.className} pb-4`} />,
  ul: (props) => (
    <ul {...props} className={`${props.className} list-disc list-inside`} />
  ),
} satisfies ComponentProps<typeof Markdown>["components"];

export default function Page({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // if project is null redirect to 404?
  if (project == null) return null;

  const hey = "hey";

  return (
    <div className="w-full text-left">
      <Titles.H1>{project.title}</Titles.H1>
      <Mono.Default className="font-mono text-base mb-8">
        {project.type} • {project.date}
      </Mono.Default>
      <Markdown
        className="font-sans text-2xl max-w-6xl leading-normal"
        components={components}
      >
        {project.content}
      </Markdown>
    </div>
  );
}
