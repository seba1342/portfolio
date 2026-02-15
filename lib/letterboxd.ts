import { list, put } from "@vercel/blob";
import Parser from "rss-parser";

export type WatchEntry = {
  filmTitle: string;
  filmYear: string;
  link: string;
  memberRating: null | number;
  posterUrl: null | string;
  review: null | string;
  watchedDate: string;
};

const BLOB_PATHNAME = "letterboxd/watches.json";

export async function readBlob(): Promise<WatchEntry[]> {
  try {
    const { blobs } = await list({ limit: 1, prefix: BLOB_PATHNAME });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return (await response.json()) as WatchEntry[];
  } catch (error) {
    console.error("Failed to read Letterboxd data from blob:", error);
    return [];
  }
}

export async function writeBlob(entries: WatchEntry[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(entries), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function parseRssFeed(): Promise<WatchEntry[]> {
  const parser = new Parser({
    customFields: {
      item: [
        ["letterboxd:filmTitle", "filmTitle"],
        ["letterboxd:filmYear", "filmYear"],
        ["letterboxd:memberRating", "memberRating"],
        ["letterboxd:watchedDate", "watchedDate"],
      ],
    },
  });

  try {
    const feed = await parser.parseURL("https://letterboxd.com/seba1342/rss/");

    return feed.items
      .map((item) => {
        const fields = item as unknown as Record<string, string>;
        const description = item.content ?? fields["content:encoded"] ?? "";

        const posterMatch = description.match(/<img\s+src="([^"]+)"/);
        const posterUrl = posterMatch?.[1] ?? null;

        const paragraphs = description.match(/<p>(?!<img)(.*?)<\/p>/gs) ?? [];
        const reviewParts = paragraphs
          .map((p) => p.replace(/<[^>]*>/g, "").trim())
          .filter((t) => t && !t.startsWith("Watched on"));
        const review = reviewParts.length > 0 ? reviewParts.join(" ") : null;

        const rating = parseFloat(fields.memberRating);

        return {
          filmTitle: fields.filmTitle ?? "",
          filmYear: fields.filmYear ?? "",
          link: item.link ?? "",
          memberRating: isNaN(rating) ? null : rating,
          posterUrl,
          review,
          watchedDate: fields.watchedDate ?? "",
        };
      })
      .filter((entry) => entry.filmTitle);
  } catch (error) {
    console.error("Failed to fetch Letterboxd RSS feed:", error);
    return [];
  }
}

export function mergeEntries(
  existing: WatchEntry[],
  incoming: WatchEntry[],
): WatchEntry[] {
  const key = (e: WatchEntry) => `${e.filmTitle}::${e.watchedDate}`;
  const map = new Map<string, WatchEntry>();
  for (const entry of existing) map.set(key(entry), entry);
  for (const entry of incoming) map.set(key(entry), entry);
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime(),
  );
}
