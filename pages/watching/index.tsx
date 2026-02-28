import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Content from "@/components/Layout/Content";
import RatingChart from "@/components/RatingChart";
import ScrambleOnHover from "@/components/ScrambleOnHover";
import { Body, Mono } from "@/components/text";
import {
  type WatchEntry,
  mergeEntries,
  parseRssFeed,
  readBlob,
  writeBlob,
} from "@/lib/letterboxd";
import type { InferGetStaticPropsType } from "next";

export async function getStaticProps() {
  const [existing, rss] = await Promise.all([readBlob(), parseRssFeed()]);
  const entries = mergeEntries(existing, rss);
  await writeBlob(entries);

  const reviewed = entries.filter((entry) => entry.memberRating);

  return { props: { entries: reviewed }, revalidate: 86400 };
}

function WatchItem({ entry }: { entry: WatchEntry }) {
  const watchedDate = new Date(entry.watchedDate);

  return (
    <div className="w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
      <Link
        className="block group"
        href={entry.link}
        rel="noopener noreferrer"
        target="_blank"
      >
        {entry.posterUrl && (
          <Image
            alt={`${entry.filmTitle} poster`}
            className="w-full rounded bg-softBark"
            height={300}
            src={entry.posterUrl}
            width={200}
          />
        )}
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex flex-row flex-wrap gap-0.5 justify-between">
            <Mono.Default className="opacity-60 text-xs">
              Released {entry.filmYear}
            </Mono.Default>
            {!isNaN(watchedDate.getTime()) && (
              <Mono.Default className="opacity-60 text-xs">
                Watched{" "}
                {watchedDate.toLocaleDateString("en-AU", {
                  month: "short",
                  year: "numeric",
                })}
              </Mono.Default>
            )}
          </div>
          <Body.Small className="font-medium leading-snug" spacing="mb-0">
            {entry.filmTitle}
          </Body.Small>
          {entry.memberRating != null && (
            <Mono.Default spacing="mb-0">
              {entry.memberRating} stars
            </Mono.Default>
          )}
          {entry.review && <Mono.Default>{entry.review}</Mono.Default>}
        </div>
      </Link>
    </div>
  );
}

export default function Watching({
  entries,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [selectedRating, setSelectedRating] = useState<null | number>(null);

  const distribution: Record<number, number> = {};
  for (const entry of entries) {
    if (entry.memberRating != null) {
      distribution[entry.memberRating] =
        (distribution[entry.memberRating] ?? 0) + 1;
    }
  }

  const filteredEntries =
    selectedRating != null
      ? entries.filter((e) => e.memberRating === selectedRating)
      : entries;

  return (
    <Content className="flex flex-col gap-4 items-center">
      <div className="flex flex-col items-center gap-1">
        <RatingChart
          distribution={distribution}
          onSelectRating={setSelectedRating}
          selectedRating={selectedRating}
        />
        <div className="flex flex-col gap-8 items-center">
          <Mono.Default className="opacity-60 text-xs text-center">
            Tap on a column above to filter by that rating.
          </Mono.Default>
          <Mono.Default className="text-center text-xs">
            {entries.length} Movies sourced from{" "}
            <Link
              className="underline"
              href="https://letterboxd.com/seba1342/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <ScrambleOnHover>letterboxd ↗</ScrambleOnHover>
            </Link>
          </Mono.Default>
        </div>
      </div>
      {filteredEntries.length > 0 ? (
        <div className="flex flex-wrap gap-4 w-full">
          {filteredEntries.map((entry) => (
            <WatchItem entry={entry} key={entry.link} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full min-h-[400px]">
          <Body.Small>
            No films rated {selectedRating} stars,{" "}
            <button
              className="underline cursor-pointer"
              onClick={() => setSelectedRating(null)}
              type="button"
            >
              click here to reset filters
            </button>
            .
          </Body.Small>
        </div>
      )}
    </Content>
  );
}
