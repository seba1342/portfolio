import { shuffleArray } from "@/lib/helpers";
import type { InferGetStaticPropsType } from "next";
import Image from "next/image";
import Link from "next/link";

type Inspiration = {
  title: string;
  base_class: string;
  created_at: string;
  source?: { url: string };
  image?: { thumb: { url: string }; square: { url: string } };
  id: number;
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
    <div className="flex flex-wrap justify-center">
      {allInspiration.map((inspiration) => (
        <InspirationItem key={inspiration.id} inspiration={inspiration} />
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
    <Link className="border-bark border-8 m-2" href={inspiration.source.url}>
      <Image
        alt={`Image of ${inspiration.title}`}
        src={inspiration.image.square.url}
        width={440}
        height={440}
      />
    </Link>
  );
}
