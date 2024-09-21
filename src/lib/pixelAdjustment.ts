import { Engine, vec, Vector } from "excalibur";

export function worldToPagePixelRatio(engine: Engine): number {
  if (engine.canvas) {
    const pageOrigin = engine.screen.worldToPageCoordinates(Vector.Zero);
    const pageDistance = engine.screen.worldToPageCoordinates(vec(1, 0)).sub(pageOrigin);
    const pixelConversion = pageDistance.x;
    return pixelConversion;
  } else {
    return 1;
  }
}
