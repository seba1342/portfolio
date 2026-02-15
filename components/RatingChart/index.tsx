"use client";

import { useEffect, useRef, useState } from "react";

type RatingDistribution = Record<number, number>;

const RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
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
  const maxCount = Math.max(...RATINGS.map((r) => distribution[r] ?? 0), 1);
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
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  // Scramble animation
  useEffect(() => {
    if (!isVisible) return;

    // Initialize all filled cells with random chars
    const initial = new Map<string, string>();
    for (const rating of RATINGS) {
      const count = distribution[rating] ?? 0;
      for (let row = 0; row < count; row++) {
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
      const count = distribution[rating] ?? 0;
      if (count === 0) return;

      const startDelay = colIndex * STAGGER_DELAY;

      const startTimeout = setTimeout(() => {
        const interval = setInterval(() => {
          setCells((prev) => {
            const next = new Map(prev);
            for (let row = 0; row < count; row++) {
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
            for (let row = 0; row < count; row++) {
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
  }, [isVisible, distribution]);

  return (
    <div
      ref={containerRef}
      className="mono w-full"
      aria-label={`Rating distribution chart showing ${Object.values(distribution).reduce((a, b) => a + b, 0)} movies across star ratings`}
    >
      <div
        className="grid gap-x-1 md:gap-x-2 items-end"
        style={{
          gridTemplateColumns: `repeat(${RATINGS.length}, 1fr)`,
        }}
      >
        {RATINGS.map((rating) => {
          const count = distribution[rating] ?? 0;
          return (
            <div
              key={rating}
              className="flex flex-col items-center"
              title={`${rating} stars: ${count} movie${count !== 1 ? "s" : ""}`}
            >
              <div className="flex flex-col items-center">
                {Array.from({ length: maxCount }, (_, i) => {
                  const row = maxCount - 1 - i;
                  const key = `${rating}-${row}`;
                  const isFilled = row < count;
                  const char = cells.get(key);

                  return (
                    <span
                      key={i}
                      className="text-xs md:text-sm leading-tight select-none"
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
