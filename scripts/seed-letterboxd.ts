import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { type WatchEntry, writeBlob } from "../lib/letterboxd";

const exportDir = process.argv[2];
if (!exportDir) {
  console.error(
    "Usage: npx tsx scripts/seed-letterboxd.ts <path-to-letterboxd-export-folder>",
  );
  process.exit(1);
}

function parseCsv(filePath: string): Record<string, string>[] {
  if (!existsSync(filePath)) return [];
  const csv = readFileSync(filePath, "utf-8").replace(/\r/g, "");
  const lines = csv.split("\n");
  const header = lines[0].split(",");

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          fields.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      fields.push(current.trim());

      const row: Record<string, string> = {};
      for (let i = 0; i < header.length; i++) {
        row[header[i]] = fields[i] ?? "";
      }
      return row;
    });
}

// Parse all CSV files from the export
const watched = parseCsv(join(exportDir, "watched.csv"));
const diary = parseCsv(join(exportDir, "diary.csv"));
const ratings = parseCsv(join(exportDir, "ratings.csv"));
const reviews = parseCsv(join(exportDir, "reviews.csv"));

console.log(
  `Parsed: ${watched.length} watched, ${diary.length} diary, ${ratings.length} ratings, ${reviews.length} reviews`,
);

// diary.csv and reviews.csv share diary-entry URIs.
// watched.csv and ratings.csv share film URIs.
// These are DIFFERENT URI types, so we merge each pair separately,
// then combine using filmTitle::filmYear to avoid duplicates.

// 1. Build diary entries (each row is a unique watch event)
//    Merge reviews by diary URI
const reviewMap = new Map<string, string>();
for (const row of reviews) {
  const text = row["Review"];
  if (text) reviewMap.set(row["Letterboxd URI"], text);
}

const diaryEntries: WatchEntry[] = diary.map((row) => {
  const uri = row["Letterboxd URI"];
  const rating = parseFloat(row["Rating"]);
  return {
    filmTitle: row["Name"],
    filmYear: row["Year"],
    link: uri,
    memberRating: isNaN(rating) ? null : rating,
    posterUrl: null,
    review: reviewMap.get(uri) ?? null,
    watchedDate: row["Watched Date"] || "",
  };
});

// 2. Build watched-only entries (films not in the diary)
//    Merge ratings by film URI
const ratingMap = new Map<string, number>();
for (const row of ratings) {
  const rating = parseFloat(row["Rating"]);
  if (!isNaN(rating)) ratingMap.set(row["Letterboxd URI"], rating);
}

// Track which films are already covered by diary entries
const diaryFilms = new Set(diary.map((row) => `${row["Name"]}::${row["Year"]}`));

const watchedOnlyEntries: WatchEntry[] = watched
  .filter((row) => !diaryFilms.has(`${row["Name"]}::${row["Year"]}`))
  .map((row) => {
    const uri = row["Letterboxd URI"];
    const rating = ratingMap.get(uri) ?? null;
    return {
      filmTitle: row["Name"],
      filmYear: row["Year"],
      link: uri,
      memberRating: rating,
      posterUrl: null,
      review: null,
      watchedDate: "",
    };
  });

const csvEntries: WatchEntry[] = [...diaryEntries, ...watchedOnlyEntries].filter(
  (entry) => entry.filmTitle,
);

console.log(
  `Built ${csvEntries.length} entries (${diaryEntries.length} from diary, ${watchedOnlyEntries.length} watched-only)`,
);

async function fetchPosterUrl(link: string): Promise<null | string> {
  try {
    const res = await fetch(link);
    const html = await res.text();
    const match = html.match(
      /\"image\":\s*\"(https:\/\/a\.ltrbxd\.com\/resized\/[^"]+crop\.jpg[^"]*)\"/,
    );
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Fetching poster URLs for ${csvEntries.length} entries...`);
  for (let i = 0; i < csvEntries.length; i++) {
    const entry = csvEntries[i];
    const poster = await fetchPosterUrl(entry.link);
    if (poster) entry.posterUrl = poster;
    console.log(
      `  [${i + 1}/${csvEntries.length}] ${entry.filmTitle} — ${poster ? "✓" : "✗"}`,
    );
    await sleep(200);
  }

  const withPosters = csvEntries.filter((e) => e.posterUrl).length;
  console.log(
    `\nPosters found: ${withPosters}/${csvEntries.length}`,
  );
  console.log(`Writing ${csvEntries.length} entries to blob (overwriting any existing data)`);
  await writeBlob(csvEntries);
  console.log("Done!");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
