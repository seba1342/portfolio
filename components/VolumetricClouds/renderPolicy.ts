export interface CloudRenderSizeInput {
  asciiEnabled: boolean;
  canvasHeight: number;
  canvasWidth: number;
  cellSize: number;
  pixelRatio: number;
}

export interface CloudRenderSize {
  framebufferHeight: number;
  framebufferWidth: number;
  resolutionHeight: number;
  resolutionWidth: number;
}

export function getCloudRenderSize({
  asciiEnabled,
  canvasHeight,
  canvasWidth,
  cellSize,
  pixelRatio,
}: CloudRenderSizeInput): CloudRenderSize {
  if (!asciiEnabled) {
    return {
      framebufferHeight: canvasHeight,
      framebufferWidth: canvasWidth,
      resolutionHeight: canvasHeight,
      resolutionWidth: canvasWidth,
    };
  }

  const physicalCellSize = cellSize * pixelRatio;
  const resolutionHeight = canvasHeight / physicalCellSize;
  const resolutionWidth = canvasWidth / physicalCellSize;

  return {
    framebufferHeight: Math.max(1, Math.ceil(resolutionHeight)),
    framebufferWidth: Math.max(1, Math.ceil(resolutionWidth)),
    resolutionHeight,
    resolutionWidth,
  };
}

export function shouldRenderShader(
  fadeProgress: number,
  documentHidden: boolean,
): boolean {
  return fadeProgress < 1 && !documentHidden;
}
