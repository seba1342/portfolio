import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import ScaleOnHover from "../ScaleOnHover";
import { Body, Titles } from "../text";

function Projects({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-2 md:gap-4 grid-cols-1 md:grid-cols-2 my-6">
      {children}
    </div>
  );
}

function Project({
  backgroundClass,
  children,
  href,
  image,
  subtitle,
  title,
}: {
  backgroundClass?: string;
  children?: React.ReactNode;
  href: string;
  image?: StaticImageData;
  subtitle?: string;
  title: string;
}) {
  if (children) {
    return (
      <ScaleOnHover>
        <Link
          className={`group rounded-2xl overflow-hidden relative flex items-center justify-center h-full min-h-[200px] ${backgroundClass ?? ""}`}
          href={href}
        >
          {children}
          <div className="absolute bottom-0 left-0 p-6 z-10">
            <Titles.H3 spacing="mb-0 md:mb-2">{title}</Titles.H3>
            {subtitle && <Body.Small>{subtitle}</Body.Small>}
          </div>
        </Link>
      </ScaleOnHover>
    );
  }

  return (
    <ScaleOnHover>
      <Link
        className={`group p-6 rounded-2xl flex justify-center h-full ${
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
        {image && (
          <Image
            alt={`${title} - ${subtitle}`}
            className="w-1/3"
            priority
            src={image}
          />
        )}
      </Link>
    </ScaleOnHover>
  );
}

export default Object.assign(Projects, { Project });
