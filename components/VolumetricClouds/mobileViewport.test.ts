import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("pins the mobile cloud background to the stable large viewport", () => {
  const source = readFileSync(
    resolve("pages/projects/flight-tracker/index.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /className="fixed inset-x-0 top-0 h-\[100lvh\] -z-10"/,
  );
});

test("uses the physical screen height for the mobile shader", () => {
  const source = readFileSync(
    resolve("pages/projects/flight-tracker/index.tsx"),
    "utf8",
  );

  assert.match(source, /window\.screen\.height/);
  assert.match(source, /style=\{\{ height: shaderHeight \}\}/);
});
