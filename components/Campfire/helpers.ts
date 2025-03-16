export function applyTaper(data: number[], rows: number, cols: number) {
  for (let y = 0; y < rows; y++) {
    const normalizedY = y / (rows - 1);
    const topRadius = (cols / 2) * (1.2 - normalizedY);
    const bottomRadius = (cols / 2) * (0.2 + normalizedY * 0.8); // Adjust for bottom curve
    const radius = y < rows / 2 ? bottomRadius : topRadius;
    for (let x = 0; x < cols; x++) {
      const distanceFromCenter = Math.abs(x - cols / 2);
      if (distanceFromCenter > radius) {
        const index = x + y * cols;
        data[index] = 0;
      }
    }
    if (Math.random() < normalizedY * 0.5) {
      const taperAmount = rndi(0, 2);
      for (let i = 0; i < taperAmount; i++) {
        data[Math.floor(Math.random() * cols) + y * cols] = 0;
      }
    }
  }
}

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
};

export const rndi = (a: number, b: number = 0): number => {
  if (a > b) [a, b] = [b, a];
  return Math.floor(a + Math.random() * (b - a + 1));
};

/**
 * Pinched from: https://play.ertdfgcvb.xyz/#/src/demos/doom_flame
 * Generates the fire-like noise effect.
 */
export function generateFireNoise() {
  const tableSize = 256;
  const r = new Array(tableSize);
  const permutationTable = new Array(tableSize * 2);

  for (let k = 0; k < tableSize; k++) {
    r[k] = Math.random();
    permutationTable[k] = k;
  }

  for (let k = 0; k < tableSize; k++) {
    const i = Math.floor(Math.random() * tableSize);
    [permutationTable[k], permutationTable[i]] = [
      permutationTable[i],
      permutationTable[k],
    ];
    permutationTable[k + tableSize] = permutationTable[k];
  }

  return function (px: number, py: number): number {
    const xi = Math.floor(px);
    const yi = Math.floor(py);

    const tx = px - xi;
    const ty = py - yi;

    const rx0 = xi % tableSize;
    const rx1 = (rx0 + 1) % tableSize;
    const ry0 = yi % tableSize;
    const ry1 = (ry0 + 1) % tableSize;

    const c00 = r[permutationTable[permutationTable[rx0] + ry0]];
    const c10 = r[permutationTable[permutationTable[rx1] + ry0]];
    const c01 = r[permutationTable[permutationTable[rx0] + ry1]];
    const c11 = r[permutationTable[permutationTable[rx1] + ry1]];

    const sx = smoothstep(0, 1, tx);
    const sy = smoothstep(0, 1, ty);

    const nx0 = mix(c00, c10, sx);
    const nx1 = mix(c01, c11, sx);

    return mix(nx0, nx1, sy);
  };
}
