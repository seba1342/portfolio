import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import ImageFrame from "../ImageFrame";
import { Body, Titles } from "../text";

function Projects({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-1 lg:grid-cols-2 my-6">
      {children}
    </div>
  );
}

function Project({
  backgroundColor,
  href,
  image,
  subtitle,
  title,
}: {
  backgroundColor: string;
  href: string;
  image: StaticImageData;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      className="group p-6 rounded-2xl transition-transform ease-in-out hover:scale-[102%] flex justify-center"
      href={href}
      style={{ backgroundColor }}
    >
      <div className="w-2/3 self-end">
        <Titles.H3 spacing="mb-0 md:mb-2">{title}</Titles.H3>
        <Body.Small>{subtitle}</Body.Small>
      </div>
      <ImageFrame alt={`${title} - ${subtitle}`} image={image} />
    </Link>
  );
}

export default Object.assign(Projects, { Project });
