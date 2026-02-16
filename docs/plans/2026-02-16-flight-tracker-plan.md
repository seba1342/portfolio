# Flight Tracker Project Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Flight Tracker project page to the portfolio site, following the existing Gratitudes page pattern.

**Architecture:** Create a new page at `/pages/projects/flight-tracker/` with its own CSS file for the sky blue gradient background, a placeholder SVG card image, and integrate it into the homepage project grid. Follows the exact same component and styling patterns as the Gratitudes page.

**Tech Stack:** Next.js (Pages Router), React, Tailwind CSS, existing component library (FixedBanner, Button, Content, text components)

---

### Task 1: Create the Flight Tracker CSS file

**Files:**
- Create: `pages/projects/flight-tracker/flight-tracker.css`

**Step 1: Create the CSS file with sky blue gradient background**

Create `pages/projects/flight-tracker/flight-tracker.css` with:

```css
.flight-tracker__background {
  background: radial-gradient(
    77.37% 50% at 50% 100%,
    #2d5f8a 0%,
    #1f4a6e 72.87%,
    #1a3a5c 100%
  );
  animation: flight-tracker-breathe 5s infinite alternate;
}

@keyframes flight-tracker-breathe {
  0% {
    background-size: 100% 100%;
    background-position: 50% 100%;
  }
  100% {
    background-size: 150% 150%;
    background-position: 50% 70%;
  }
}
```

This mirrors the Gratitudes CSS pattern (`gratitudes.css:1-20`) but with sky blue colors instead of purple.

**Step 2: Import CSS in globals.css**

In `globals.css:2`, add a new import line after the gratitudes CSS import:

```css
@import url("pages/projects/flight-tracker/flight-tracker.css");
```

The file should look like:
```css
@import url("components/text/text.css");
@import url("pages/projects/gratitudes/gratitudes.css");
@import url("pages/projects/flight-tracker/flight-tracker.css");

@tailwind base;
...
```

**Step 3: Commit**

```bash
git add pages/projects/flight-tracker/flight-tracker.css globals.css
git commit -m "Add flight-tracker CSS with sky blue gradient background"
```

---

### Task 2: Create a placeholder card image

**Files:**
- Create: `pages/projects/flight-tracker/assets/flight-tracker.svg`

**Step 1: Create a simple SVG placeholder**

Create `pages/projects/flight-tracker/assets/flight-tracker.svg` — a simple airplane icon on a transparent background that will serve as the card image. Use a white airplane silhouette since the card background is dark blue.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" fill="none">
  <g transform="translate(100, 150)">
    <path d="M0,-80 L15,-20 L60,20 L15,20 L15,50 L30,65 L-30,65 L-15,50 L-15,20 L-60,20 L-15,-20 Z" fill="white" opacity="0.9"/>
  </g>
</svg>
```

**Step 2: Commit**

```bash
git add pages/projects/flight-tracker/assets/flight-tracker.svg
git commit -m "Add placeholder flight tracker card image"
```

---

### Task 3: Create the Flight Tracker project page

**Files:**
- Create: `pages/projects/flight-tracker/index.tsx`

**Step 1: Create the project page**

Create `pages/projects/flight-tracker/index.tsx`. This follows the exact same pattern as `pages/projects/gratitudes/index.tsx`:

```tsx
import Button from "@/components/Button";
import FixedBanner from "@/components/FixedBanner";
import Content from "@/components/Layout/Content";
import { Body, Mono, Titles } from "@/components/text";
import * as COLORS from "@/lib/colors";

export const theme = {
  alternateBackgroundColor: "#87CEEB",
  backgroundColor: "#1a3a5c",
};

export default function FlightTracker() {
  return (
    <>
      <div
        className={`flight-tracker__background flex flex-col justify-center items-center h-full pt-36 pb-8 w-full relative`}
      >
        <FixedBanner backgroundColor={theme.backgroundColor}>
          <FixedBanner.Text>
            2025 · Arduino, C++
          </FixedBanner.Text>
        </FixedBanner>
        <Titles.H1 align="center" color="light">
          Flight Tracker
        </Titles.H1>
        <Body.Default align="center" color="light">
          Your eyes in the sky.
        </Body.Default>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 pb-16">
          <Button
            backgroundColor={theme.alternateBackgroundColor}
            href="https://github.com/seba1342/flight-tracker"
          >
            View on GitHub
          </Button>
        </div>
      </div>
      <Content className="pt-12">
        <Titles.H3>
          Flight Tracker is an Arduino project that tracks nearby flights and
          tells you where they&apos;re coming from and going to.
        </Titles.H3>
        <Mono.Default className="w-full text-center py-12">
          {">< >< >< >< >< >< >< >< ><"}
        </Mono.Default>
        <Titles.H2 className="pt-8">Tech Stack</Titles.H2>
        <Titles.H3>Arduino &amp; C++</Titles.H3>
        <Body.Default>
          Built on Arduino with C++, the Flight Tracker uses ADS-B signals to
          detect aircraft flying nearby. It processes flight data to identify
          where planes are coming from and where they&apos;re headed.
        </Body.Default>

        <Titles.H2>Features</Titles.H2>
        <Titles.H3>Nearby flight detection</Titles.H3>
        <Body.Default>
          Picks up ADS-B signals from aircraft in your area, giving you
          real-time visibility into what&apos;s flying overhead.
        </Body.Default>

        <Titles.H3>Origin &amp; destination info</Titles.H3>
        <Body.Default>
          For each detected flight, the tracker tells you where the plane is
          coming from and where it&apos;s going.
        </Body.Default>
      </Content>
    </>
  );
}
```

Key differences from Gratitudes:
- Sky blue theme colors instead of purple
- Single "View on GitHub" button instead of app store buttons
- No screenshot images (hardware project — photos to be added later)
- Content describes hardware/Arduino project rather than mobile app

**Step 2: Commit**

```bash
git add pages/projects/flight-tracker/index.tsx
git commit -m "Add Flight Tracker project page"
```

---

### Task 4: Add Flight Tracker to homepage project grid

**Files:**
- Modify: `pages/index.tsx:5,38-46`

**Step 1: Update the homepage**

In `pages/index.tsx`, add the Flight Tracker project card import and a second `Projects.Project` entry.

Add the SVG import after line 5 (the gratitudes image import):

```tsx
import flightTrackerImage from "./projects/flight-tracker/assets/flight-tracker.svg";
```

Then add a second `Projects.Project` inside the `<Projects>` component (after the Gratitudes project, around line 45):

```tsx
<Projects.Project
  backgroundClass="flight-tracker__background"
  href="/projects/flight-tracker"
  image={flightTrackerImage}
  subtitle="Your eyes in the sky."
  title="Flight Tracker"
/>
```

The full `<Projects>` section should look like:

```tsx
<Projects>
  <Projects.Project
    backgroundClass="gratitudes__background"
    href="/projects/gratitudes"
    image={gratitudesImage}
    subtitle="A daily journalling app."
    title="Gratitudes"
  />
  <Projects.Project
    backgroundClass="flight-tracker__background"
    href="/projects/flight-tracker"
    image={flightTrackerImage}
    subtitle="Your eyes in the sky."
    title="Flight Tracker"
  />
</Projects>
```

With 2 projects, the grid (`grid-cols-1 md:grid-cols-2` in `components/Projects/index.tsx:8`) will show them side by side on desktop.

**Step 2: Commit**

```bash
git add pages/index.tsx
git commit -m "Add Flight Tracker to homepage project grid"
```

---

### Task 5: Verify the build

**Step 1: Run the Next.js build**

```bash
npm run build
```

Expected: Build completes successfully with no errors. The new page should appear in the build output as a static page.

**Step 2: If build fails, fix any issues and re-run**

Common issues:
- SVG import may need special handling — if so, use a PNG placeholder or adjust `next.config.js`
- TypeScript errors from missing types

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "Fix build issues for flight tracker page"
```
