import assert from "node:assert/strict";
import test from "node:test";
import { getCloudRenderSize, shouldRenderShader } from "./renderPolicy";

test("sizes the cloud framebuffer to the physical ASCII grid", () => {
  assert.deepEqual(
    getCloudRenderSize({
      asciiEnabled: true,
      canvasHeight: 2532,
      canvasWidth: 1170,
      cellSize: 8,
      pixelRatio: 3,
    }),
    {
      framebufferHeight: 106,
      framebufferWidth: 49,
      resolutionHeight: 105.5,
      resolutionWidth: 48.75,
    },
  );
});

test("uses canvas resolution when ASCII is disabled", () => {
  assert.deepEqual(
    getCloudRenderSize({
      asciiEnabled: false,
      canvasHeight: 900,
      canvasWidth: 1440,
      cellSize: 8,
      pixelRatio: 2,
    }),
    {
      framebufferHeight: 900,
      framebufferWidth: 1440,
      resolutionHeight: 900,
      resolutionWidth: 1440,
    },
  );
});

test("renders only while the shader and document are visible", () => {
  assert.equal(shouldRenderShader(0.99, false), true);
  assert.equal(shouldRenderShader(1, false), false);
  assert.equal(shouldRenderShader(0, true), false);
});
