import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("keeps home project cards in equal-height rows", () => {
  const source = readFileSync(resolve("components/Projects/index.tsx"), "utf8");

  assert.match(source, /auto-rows-fr/);
});

test("uses the live cloud shader for the Flight Tracker home card", () => {
  const source = readFileSync(resolve("pages/index.tsx"), "utf8");

  assert.match(source, /dynamic\(\s*\(\) => import\("@\/components\/VolumetricClouds"\)/);
  assert.match(source, /<VolumetricClouds[\s\S]*maxFps=\{24\}/);
  assert.match(source, /showControls=\{false\}/);
  assert.doesNotMatch(source, /flightTrackerHero/);
});
