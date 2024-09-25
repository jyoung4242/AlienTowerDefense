import { Actor, Engine, Vector } from "excalibur";
import { Resources } from "../resources";

export class FireWarmup extends Actor {
  constructor() {
    super({
      name: "fireWarmup",
      x: 0,
      y: 0,
      width: 16,
      height: 16,
      anchor: Vector.Zero,
    });
  }
  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.star.toSprite());
    this.scale = new Vector(0.2, 0.2);

    this.actions.scaleTo(new Vector(1.1, 1.1), new Vector(0.5, 0.5));
  }
}
