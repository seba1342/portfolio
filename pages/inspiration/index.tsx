import type { InferGetStaticPropsType } from "next";
import Content from "@/components/Layout/Content";
import ScaleOnHover from "@/components/ScaleOnHover";
import { shuffleArray } from "@/lib/helpers";
import Image from "next/image";
import Link from "next/link";

type Inspiration = {
  base_class: string;
  created_at: string;
  id: number;
  image?: { square: { url: string }; thumb: { url: string } };
  source?: { url: string };
  title: string;
};

export async function getStaticProps() {
  const res = await fetch(
    "https://api.are.na/v2/channels/the-interwebz?per=100"
  );
  const data = (await res.json()) as { contents: Inspiration[] };
  const allInspiration = shuffleArray(data.contents);
  return { props: { allInspiration }, revalidate: 86400 };
}

export default function Inspiration({
  allInspiration,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Content className="flex flex-row flex-wrap gap-4 justify-start items-start">
      {allInspiration.map((inspiration) => (
        <InspirationItem inspiration={inspiration} key={inspiration.id} />
      ))}
    </Content>
  );
}

function InspirationItem({ inspiration }: { inspiration: Inspiration }) {
  if (
    inspiration == null ||
    inspiration.base_class !== "Block" ||
    inspiration.source?.url == null ||
    inspiration.image == null
  )
    return null;

  return (
    <Link
      className="relative aspect-w-1 aspect-h-1 w-96 sm:w-80"
      href={inspiration.source.url}
      target="_blank"
    >
      <ScaleOnHover>
        <Image
          alt={`Image of ${inspiration.title}`}
          className="w-full h-full object-contain bg-softBark rounded"
          height={440}
          src={inspiration.image.square.url}
          width={440}
        />
      </ScaleOnHover>
    </Link>
  );
}
