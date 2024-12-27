import { theme } from "@/pages/projects/gratitudes";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

// assets
import gratitudesEntryImage from "../../pages/projects/gratitudes/assets/gratitudes-entry.png";
import gratitudesHomeImage from "../../pages/projects/gratitudes/assets/gratitudes-home.png";
import Button from "../Button";
import { Body, Titles } from "../text";

function Hero({
  backgroundColor,
  href,
  image,
  style,
  subtitle,
  title,
}: {
  backgroundColor: string;
  href: string;
  image: StaticImageData;
  style: string;
  subtitle: string;
  title: string;
}) {
  return (
    <header
      className={`gratitudes__background flex flex-col justify-center items-center h-full pt-36 pb-16 w-[100vw] mt-[92px] relative ${style}`}
    >
      <Titles.H1 align="center" color="light">
        {title}
      </Titles.H1>
      <Body.Default align="center" color="light">
        {subtitle}
      </Body.Default>
      <div className="flex flex-row gap-4 mt-4 pb-16">
        <Button backgroundColor={theme.alternateBackgroundColor}>
          iOS Download
        </Button>
        <Button backgroundColor={theme.alternateBackgroundColor}>
          Android Download
        </Button>
      </div>

      <div className="flex flex-row gap-12 items-center justify-center">
        <Image
          alt="Gratitudes home page"
          className="max-w-[300px]"
          priority
          src={gratitudesHomeImage}
        />
        <Image
          alt="Gratitudes entry page"
          className="max-w-[300px]"
          priority
          src={gratitudesEntryImage}
        />
      </div>
    </header>
  );
}

export default Object.assign({ Hero });
