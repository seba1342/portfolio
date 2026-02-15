# ASCII Rating Distribution Chart

## Overview

A histogram at the top of `/watching` showing movie rating distribution. Each column represents a rating (0.5-5 in 0.5 increments). Height = count of movies at that rating.

## Component

**`components/RatingChart/index.tsx`** - Client component using CSS grid of `<span>` elements.

- 10 columns (0.5, 1, 1.5, ..., 5) x N rows (N = max count)
- Each filled cell contains `#`, empty cells are spaces
- Monospace font (Geist Mono), bark brown on oatmeal
- Labels along the bottom showing star values

## Animation

- Triggered once by IntersectionObserver when chart scrolls into view
- Characters start as random scrambled characters, resolve to `#` over ~500ms
- Columns animate left-to-right with stagger delay
- Plays exactly once (ref tracks completion)

## Data Flow

- `WatchEntry[]` already fetched in `getStaticProps`
- Page computes distribution: `Record<number, number>` (rating -> count)
- Passed as prop to `RatingChart`

## Responsive

- Full width, consistent spacing
- Smaller font on mobile, same grid structure

## Accessibility

- `aria-label` on chart container
- `title` attributes on columns: "X stars: Y movies"
