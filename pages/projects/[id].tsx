import { Project, getAllProjectIds, getProjectData } from "../../lib/projects";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { ComponentProps } from "react";
import Markdown from "react-markdown";

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
  // // Override the rendering of images to remove the <p> tag
  // img: ({ src, alt }) => <Image src={src} alt={alt} width={600} height={800} />,
  p: (props) => <p {...props} className={`${props.className} pb-4`} />,
} satisfies ComponentProps<typeof Markdown>["components"];

export default function Page({
  project,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  // if project is null redirect to 404?
  if (project == null) return null;

  return (
    <div className="w-full text-left">
      <h1 className="text-8xl mb-4">{project.title}</h1>
      <p className="font-mono text-base mb-8">
        {project.type} • {project.date}
      </p>
      <Markdown
        className="font-sans text-2xl max-w-6xl leading-normal"
        components={components}
      >
        {project.content}
      </Markdown>
    </div>
  );
}
