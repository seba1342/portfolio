import { Titles } from "@/components/text/Titles";
import { Project, getAllProjectIds, getProjectData } from "../../lib/projects";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { ComponentProps } from "react";
import Markdown from "react-markdown";
import { Mono } from "@/components/text/Mono";

type Props = { project: Project };

export const getStaticPaths: GetStaticPaths = () => {
  const paths = getAllProjectIds().map((id) => ({ params: { id } }));
  return {
    paths,
    fallback: false,
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
  h1: (props) => (
    <Titles.H1 className={`${props.className} pb-4`}>
      {props.children}
    </Titles.H1>
  ),
  h2: (props) => (
    <Titles.H2 className={`${props.className} mt-8`}>
      {props.children}
    </Titles.H2>
  ),
  p: (props) => <p {...props} className={`${props.className} pb-4`} />,
  a: (props) => <a {...props} className={`${props.className} underline`} />,
  ul: (props) => (
    <ul {...props} className={`${props.className} list-disc list-inside`} />
  ),
} satisfies ComponentProps<typeof Markdown>["components"];

export default function Page({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // if project is null redirect to 404?
  if (project == null) return null;

  return (
    <div className="w-full text-left">
      <Titles.H1 className="mb-4">{project.title}</Titles.H1>
      <Mono.Body className="font-mono text-base mb-8">
        {project.type} • {project.date}
      </Mono.Body>
      <Markdown
        className="font-sans text-2xl max-w-6xl leading-normal"
        components={components}
      >
        {project.content}
      </Markdown>
    </div>
  );
}
