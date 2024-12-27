import type { InferGetStaticPropsType } from "next";

import { Body, Titles } from "@/components/text";
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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {allInspiration.map((inspiration) => (
        <InspirationItem inspiration={inspiration} key={inspiration.id} />
      ))}
    </div>
  );
}

function InspirationItem({ inspiration }: { inspiration: Inspiration }) {
  if (
    inspiration == null ||
    inspiration.base_class !== "Block" ||
    inspiration.source?.url == null ||
    inspiration.image == null
  )
    return;

  return (
    <Link
      className="relative aspect-w-1 aspect-h-1"
      href={inspiration.source.url}
    >
      <Image
        alt={`Image of ${inspiration.title}`}
        className="w-full h-full object-contain bg-softBark"
        height={440}
        src={inspiration.image.square.url}
        width={440}
      />
    </Link>
  );
}
