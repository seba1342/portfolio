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

  // Scramble animation
  useEffect(() => {
    if (!isVisible) return;

    // Initialize all filled cells with random chars (using scaled heights)
    const initial = new Map<string, string>();
    for (const rating of RATINGS) {
      const raw = distribution[rating] ?? 0;
      const scaled = Math.round((raw / maxCount) * MAX_ROWS);
      for (let row = 0; row < scaled; row++) {
        initial.set(`${rating}-${row}`, getRandomChar());
      }
    }
    setCells(new Map(initial));

    const SCRAMBLE_DURATION = 400;
    const STAGGER_DELAY = 50;
    const SCRAMBLE_INTERVAL = 50;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    RATINGS.forEach((rating, colIndex) => {
      const raw = distribution[rating] ?? 0;
      const scaled = Math.round((raw / maxCount) * MAX_ROWS);
      if (scaled === 0) return;

      const startDelay = colIndex * STAGGER_DELAY;

      const startTimeout = setTimeout(() => {
        const interval = setInterval(() => {
          setCells((prev) => {
            const next = new Map(prev);
            for (let row = 0; row < scaled; row++) {
              const key = `${rating}-${row}`;
              if (next.get(key) !== CELL_CHAR) {
                next.set(key, getRandomChar());
              }
            }
            return next;
          });
        }, SCRAMBLE_INTERVAL);
        intervals.push(interval);

        const resolveTimeout = setTimeout(() => {
          clearInterval(interval);
          setCells((prev) => {
            const next = new Map(prev);
            for (let row = 0; row < scaled; row++) {
              next.set(`${rating}-${row}`, CELL_CHAR);
            }
            return next;
          });
        }, SCRAMBLE_DURATION);
        timeouts.push(resolveTimeout);
      }, startDelay);
      timeouts.push(startTimeout);
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
              className="flex flex-col items-center px-2"
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
                      {isFilled && isVisible ? (char ?? " ") : " "}
                    </span>
                  );
                })}
              </div>
              <span className="text-[10px] md:text-xs opacity-60 mt-1 select-none">
                {rating}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
