# Flight Tracker Project Page Design

## Summary

Add a new project page for the Flight Tracker hardware project, following the same pattern as the existing Gratitudes page. The page showcases the Arduino-based flight tracking project with a sky blue theme.

## Project Details

- **Title:** Flight Tracker
- **Subtitle:** "Your eyes in the sky"
- **Description:** An Arduino project that tracks nearby flights and tells you where they're coming from/going to.
- **Tech stack:** Arduino, C++
- **Year:** 2025
- **GitHub:** https://github.com/seba1342/flight-tracker

## Color Theme

- Primary background: Deep sky blue gradient (`#1a3a5c` to `#2d5f8a`)
- Accent color: Light sky blue (`#87CEEB`) for buttons
- Text: Light/white on dark backgrounds

## Page Structure

### Hero Section
- Radial gradient sky blue background with subtle animation
- FixedBanner: "2025 · Arduino, C++"
- H1: "Flight Tracker"
- Body: "Your eyes in the sky."
- Button: "View on GitHub" linking to the repo
- Placeholder area for hardware photos (to be added later)

### Content Section
- Description of the project
- Tech stack details
- Features overview

## Homepage Integration

- New project card in the homepage Projects grid alongside Gratitudes
- Sky blue background, same card pattern as Gratitudes

## Files

### New
- `/pages/projects/flight-tracker/index.tsx` — Project page component
- `/pages/projects/flight-tracker/flight-tracker.css` — Custom background styling
- `/pages/projects/flight-tracker/assets/` — Placeholder image for card

### Modified
- `/pages/index.tsx` — Add Flight Tracker project card
- `/styles/globals.css` — Import flight-tracker CSS
