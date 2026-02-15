"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type RatingDistribution = Record<number, number>;

const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const MAX_ROWS = 10;
const SCRAMBLE_CHARS = "#@$%&*+=~?!";
const CELL_CHAR = "#";

function getRandomChar(): string {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

export default function RatingChart({
  distribution,
}: {
  distribution: RatingDistribution;
}) {
  const distributionKey = JSON.stringify(distribution);
  const maxCount = useMemo(
    () => Math.max(...RATINGS.map((r) => distribution[r] ?? 0), 1),
    [distributionKey],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);
  const [cells, setCells] = useState<Map<string, string>>(new Map());
  const [resolvedLabels, setResolvedLabels] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

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

    const COL_STAGGER = 50; // ms between columns starting
    const ROW_DELAY = 40; // ms between rows appearing within a column
    const SCRAMBLE_DURATION = 200; // ms of scrambling per row
    const SCRAMBLE_INTERVAL = 50; // ms between character changes

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    RATINGS.forEach((rating, colIndex) => {
      const raw = distribution[rating] ?? 0;
      const scaled = Math.round((raw / maxCount) * MAX_ROWS);
      const colStart = colIndex * COL_STAGGER;

      // Fade in label when column animation completes
      const colDuration =
        scaled > 0
          ? (scaled - 1) * ROW_DELAY + SCRAMBLE_DURATION
          : SCRAMBLE_DURATION;

      const labelTimeout = setTimeout(() => {
        setResolvedLabels((prev) => new Set(prev).add(rating));
      }, colStart + colDuration);
      timeouts.push(labelTimeout);

      if (scaled === 0) return;

      // Each row reveals bottom-to-top with stagger
      for (let row = 0; row < scaled; row++) {
        const key = `${rating}-${row}`;
        const revealDelay = colStart + row * ROW_DELAY;

        // Reveal this row with a random char
        const revealTimeout = setTimeout(() => {
          setCells((prev) => new Map(prev).set(key, getRandomChar()));

          // Scramble this cell while it's active
          const interval = setInterval(() => {
            setCells((prev) => {
              const val = prev.get(key);
              if (val === CELL_CHAR) return prev;
              return new Map(prev).set(key, getRandomChar());
            });
          }, SCRAMBLE_INTERVAL);
          intervals.push(interval);

          // Resolve to final char
          const resolveTimeout = setTimeout(() => {
            clearInterval(interval);
            setCells((prev) => new Map(prev).set(key, CELL_CHAR));
          }, SCRAMBLE_DURATION);
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

  const replay = () => {
    setCells(new Map());
    setResolvedLabels(new Set());
    setIsVisible(false);
    requestAnimationFrame(() => setIsVisible(true));
  };

  return (
    <div
      aria-label={`Rating distribution chart showing ${Object.values(distribution).reduce((a, b) => a + b, 0)} movies across star ratings`}
      className="mono"
      ref={containerRef}
    >
      <div
        className="inline-grid gap-x-0 items-end"
        style={{
          gridTemplateColumns: `repeat(${RATINGS.length}, auto)`,
        }}
      >
        {RATINGS.map((rating) => {
          const raw = distribution[rating] ?? 0;
          const scaled = Math.round((raw / maxCount) * MAX_ROWS);
          return (
            <div
              className="flex flex-col items-center px-1"
              key={rating}
              title={`${rating} stars: ${raw} movie${raw !== 1 ? "s" : ""}`}
            >
              <div className="flex flex-col items-center">
                {Array.from({ length: MAX_ROWS }, (_, i) => {
                  const row = MAX_ROWS - 1 - i;
                  const key = `${rating}-${row}`;
                  const isFilled = row < scaled;
                  const char = cells.get(key);

                  return (
                    <span
                      className="text-xs md:text-sm leading-none select-none"
                      key={i}
                      style={{
                        minWidth: "1ch",
                        textAlign: "center",
                      }}
                    >
                      {isFilled && char ? char : "\u00A0"}
                    </span>
                  );
                })}
              </div>
              <span
                className="text-[6px] md:text-xs mt-1 select-none text-xs transition-all duration-300 ease-out"
                style={{
                  opacity: resolvedLabels.has(rating) ? 0.6 : 0,
                  transform: resolvedLabels.has(rating)
                    ? "translateY(0)"
                    : "translateY(4px)",
                }}
              >
                {rating}
              </span>
            </div>
          );
        })}
      </div>
      <button
        className="text-xs opacity-40 hover:opacity-70 mt-2 cursor-pointer"
        onClick={replay}
        type="button"
      >
        [replay]
      </button>
    </div>
  );
}
