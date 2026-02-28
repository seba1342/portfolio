# ASCII Rating Distribution Chart - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an ASCII art histogram to the `/watching` page showing the distribution of movie ratings across star levels.

**Architecture:** A client-side React component using CSS grid of `<span>` elements, one per cell. Each filled cell contains `#`. On first scroll-into-view, a scramble animation plays once: random characters resolve to `#` with left-to-right column stagger.

**Tech Stack:** React 19, Next.js 15 (Pages Router), TypeScript, Tailwind CSS, Geist Mono font.

---

### Task 1: Create the RatingChart component with static rendering

**Files:**
- Create: `components/RatingChart/index.tsx`

**Step 1: Create the component file**

Create `components/RatingChart/index.tsx` with the following implementation:

```tsx
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

  // Build target cells map (what the chart should look like when done)
  const targetCells = new Map<string, boolean>();
  for (const rating of RATINGS) {
    const count = distribution[rating] ?? 0;
    for (let row = 0; row < maxCount; row++) {
      const isFilled = row < count;
      targetCells.set(`${rating}-${row}`, isFilled);
    }
  }

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

    const SCRAMBLE_DURATION = 400; // ms of scrambling per column
    const STAGGER_DELAY = 50; // ms between columns starting
    const SCRAMBLE_INTERVAL = 50; // ms between character changes

    // For each column, scramble then resolve
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    RATINGS.forEach((rating, colIndex) => {
      const count = distribution[rating] ?? 0;
      if (count === 0) return;

      const startDelay = colIndex * STAGGER_DELAY;

      // Start scrambling after stagger delay
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

        // Resolve to final character after scramble duration
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
                  const row = maxCount - 1 - i; // render top-down
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
```

**Step 2: Verify the file was created**

Run: `ls -la components/RatingChart/index.tsx`
Expected: File exists

**Step 3: Commit**

```bash
git add components/RatingChart/index.tsx
git commit -m "feat: add RatingChart component with scramble animation"
```

---

### Task 2: Integrate RatingChart into the watching page

**Files:**
- Modify: `pages/watching/index.tsx`

**Step 1: Add the distribution computation and RatingChart to the watching page**

In `pages/watching/index.tsx`:

1. Add import at the top:
```tsx
import dynamic from "next/dynamic";

const RatingChart = dynamic(() => import("@/components/RatingChart"), {
  ssr: false,
});
```

2. In the `Watching` component body, before the return, compute the distribution:
```tsx
const distribution: Record<number, number> = {};
for (const entry of entries) {
  if (entry.memberRating != null) {
    distribution[entry.memberRating] =
      (distribution[entry.memberRating] ?? 0) + 1;
  }
}
```

3. Add `<RatingChart distribution={distribution} />` inside the `Content` div, between the Mono header text and the flex-wrap movie grid:
```tsx
<RatingChart distribution={distribution} />
```

**Step 2: Verify the dev server compiles without errors**

Run: `cd /Users/seba/conductor/workspaces/portfolio/chicago && yarn dev`
Expected: Compiles successfully, no TypeScript errors

**Step 3: Commit**

```bash
git add pages/watching/index.tsx
git commit -m "feat: integrate RatingChart into watching page"
```

---

### Task 3: Visual polish and responsive tuning

**Files:**
- Modify: `components/RatingChart/index.tsx`
- Modify: `pages/watching/index.tsx`

**Step 1: Review in browser at mobile, tablet, and desktop widths**

Check that:
- Chart renders correctly at 375px, 768px, and 1200px widths
- Labels are readable
- Spacing between chart and movie grid looks balanced
- Animation plays once on scroll

**Step 2: Adjust spacing/sizing if needed**

Tune the Tailwind classes on the chart container and the gap between the chart and the movie grid. Ensure the chart has appropriate vertical margin (e.g., `mb-4` or `mb-6`) so it doesn't crowd the movie list.

**Step 3: Commit**

```bash
git add components/RatingChart/index.tsx pages/watching/index.tsx
git commit -m "feat: polish RatingChart responsive layout"
```
