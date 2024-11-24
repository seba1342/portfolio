import { Titles } from "../text";

function Projects({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">{children}</div>
  );
}

function Project({
  backgroundColor,
  title,
}: {
  backgroundColor: string;
  title: string;
}) {
  return (
    <div>
      <Titles.H3>Project Title</Titles.H3>
    </div>
  );
}

export default Object.assign(Projects, { Project });
