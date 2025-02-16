import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import ScaleOnHover from "../ScaleOnHover";
import { Body, Titles } from "../text";

function Projects({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-1 lg:grid-cols-2 my-6">
      {children}
    </div>
  );
}

function Project({
  backgroundClass,
  href,
  image,
  subtitle,
  title,
}: {
  backgroundClass?: string;
  href: string;
  image: StaticImageData;
  subtitle: string;
  title: string;
}) {
  return (
    <ScaleOnHover>
      <Link
        className={`group p-6 rounded-2xl flex justify-center ${
          backgroundClass ?? ""
        }`}
        href={href}
      >
        <div className="w-2/3 self-end">
          <Titles.H3 color="light" spacing="mb-0 md:mb-2">
            {title}
          </Titles.H3>
          <Body.Small color="light">{subtitle}</Body.Small>
        </div>
        <Image alt={`${title} - ${subtitle}`} className="w-1/3" src={image} />
      </Link>
    </ScaleOnHover>
  );
}

export default Object.assign(Projects, { Project });
