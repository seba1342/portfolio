import Link from "next/link";

import { Titles } from "../text";

function Projects({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-1 lg:grid-cols-2 my-6">
      {children}
    </div>
  );
}

function Project({
  backgroundColor,
  subtitle,
  title,
}: {
  backgroundColor: string;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      className="p-4 rounded-2xl pb-24 transition-transform ease-in-out hover:scale-[102%]"
      href="/projects/gratitudes"
      style={{ backgroundColor }}
    >
      <Titles.H2 color="light">{title}</Titles.H2>
      <Titles.H3 color="light">{subtitle}</Titles.H3>
    </Link>
  );
}

export default Object.assign(Projects, { Project });
