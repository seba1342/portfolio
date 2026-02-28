"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mono } from "../text";

type RatingDistribution = Record<number, number>;

const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const MAX_ROWS = 15;
const SCRAMBLE_CHARS = "*~-=+:^·×°•";
const CELL_CHAR = "*";
const CELL_WIDTH = 4;

// Animation timing
const COL_STAGGER = 50; // ms between columns starting
const ROW_DELAY = 33; // ms between rows appearing within a column
const SCRAMBLE_DURATION_BASE = 750; // ms of scrambling for first row
const SCRAMBLE_DURATION_INCREMENT = 33; // extra ms per row
const SCRAMBLE_INTERVAL = 50; // ms between character changes

function getRandomChars(): string {
  return Array.from(
    { length: CELL_WIDTH },
    () => SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
  ).join("");
}

const RESTING_CHARS = CELL_CHAR.repeat(CELL_WIDTH);

export default function RatingChart({
  distribution,
  onSelectRating,
  selectedRating,
}: {
  distribution: RatingDistribution;
  onSelectRating?: (rating: null | number) => void;
  selectedRating?: null | number;
}) {
  const distributionKey = JSON.stringify(distribution);
  const maxCount = useMemo(
    () => Math.max(...RATINGS.map((r) => distribution[r] ?? 0), 1),
    // distributionKey is a stringified version of distribution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [distributionKey],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [cells, setCells] = useState<Map<string, string>>(new Map());
  const [isVisible, setIsVisible] = useState(false);
  const [completedCols, setCompletedCols] = useState<Set<number>>(new Set());

  // IntersectionObserver: trigger animation once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          setIsVisible(true);
          hasAnimatedRef.current = true;
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Scramble + grow upward animation
  useEffect(() => {
    if (!isVisible) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    RATINGS.forEach((rating, colIndex) => {
      const raw = distribution[rating] ?? 0;
      const scaled =
        raw > 0 ? Math.max(1, Math.round((raw / maxCount) * MAX_ROWS)) : 0;
      const colStart = colIndex * COL_STAGGER;

      if (scaled === 0) return;

      // Mark column complete when top cell is revealed
      const topRow = scaled - 1;
      const topRevealDelay = colStart + topRow * ROW_DELAY;
      const colDoneTimeout = setTimeout(() => {
        setCompletedCols((prev) => new Set(prev).add(colIndex));
      }, topRevealDelay);
      timeouts.push(colDoneTimeout);

      // Each row reveals bottom-to-top with stagger
      for (let row = 0; row < scaled; row++) {
        const key = `${rating}-${row}`;
        const revealDelay = colStart + row * ROW_DELAY;

        // Reveal this row with a random char
        const revealTimeout = setTimeout(() => {
          setCells((prev) => new Map(prev).set(key, getRandomChars()));

          // Scramble this cell while it's active
          const interval = setInterval(() => {
            setCells((prev) => {
              const val = prev.get(key);
              if (val === RESTING_CHARS) return prev;
              return new Map(prev).set(key, getRandomChars());
            });
          }, SCRAMBLE_INTERVAL);
          intervals.push(interval);

          // Resolve to final chars (longer scramble for higher rows)
          const scrambleDuration =
            SCRAMBLE_DURATION_BASE + row * SCRAMBLE_DURATION_INCREMENT;
          const resolveTimeout = setTimeout(() => {
            clearInterval(interval);
            setCells((prev) => new Map(prev).set(key, RESTING_CHARS));
          }, scrambleDuration);

          timeouts.push(resolveTimeout);
        }, revealDelay);

        timeouts.push(revealTimeout);
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, distributionKey]);

  return (
    <div
      aria-label={`Rating distribution chart showing ${Object.values(distribution).reduce((a, b) => a + b, 0)} movies across star ratings`}
      className="mono cursor-pointer"
      onClick={() => onSelectRating?.(null)}
      ref={containerRef}
    >
      <div
        className="group relative inline-grid gap-x-0 items-end"
        style={{
          gridTemplateColumns: `repeat(${RATINGS.length}, auto)`,
        }}
      >
        {RATINGS.map((rating, colIndex) => {
          const raw = distribution[rating] ?? 0;
          const scaled =
            raw > 0 ? Math.max(1, Math.round((raw / maxCount) * MAX_ROWS)) : 0;
          return (
            <div
              className="flex flex-col items-center px-1 relative z-10 transition-[opacity,transform] duration-200 md:group-hover:opacity-60 md:hover:!opacity-100"
              key={rating}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRating?.(selectedRating === rating ? null : rating);
              }}
              style={{
                ...(selectedRating != null && {
                  opacity: selectedRating === rating ? 1 : 0.3,
                }),
              }}
              title={`${rating} stars: ${raw} movie${raw !== 1 ? "s" : ""}`}
            >
              <div className="flex flex-col items-center">
                {Array.from({ length: MAX_ROWS }, (_, i) => {
                  const row = MAX_ROWS - 1 - i;
                  const key = `${rating}-${row}`;
                  const isFilled = row < scaled;
                  const char = cells.get(key);
                  const isTopOfBar = row === scaled - 1;

                  return (
                    <span
                      className="text-xs select-none relative min-w-[4ch] text-center"
                      key={i}
                      style={{ lineHeight: 0.8 }}
                    >
                      {isTopOfBar && (
                        <span
                          className="absolute left-0 right-0 bottom-full text-center select-none mb-1 text-xs transition-[opacity,transform] ease-out duration-300 delay-150"
                          style={{
                            opacity: completedCols.has(colIndex) ? 0.4 : 0,
                            transform: completedCols.has(colIndex)
                              ? "translateY(0)"
                              : "translateY(4px)",
                          }}
                        >
                          {raw}
                        </span>
                      )}
                      {isFilled && char ? char : "\u00A0"}
                    </span>
                  );
                })}
              </div>
              <span className="text-xs select-none opacity-40">{rating}</span>
            </div>
          );
        })}
      </div>
      <Mono.Default className="pt-1 opacity-60 text-xs text-center">
        {selectedRating != null
          ? `Filtering by: ${selectedRating} star movies`
          : "Tap on a column above to filter by that rating."}
      </Mono.Default>
    </div>
  );
}
