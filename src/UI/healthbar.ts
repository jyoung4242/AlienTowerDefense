import { Color, Rectangle, ScreenElement, Vector } from "excalibur";

export class HealthBar extends ScreenElement {
  percent: number;
  child: ScreenElement;
  constructor(public dims: Vector, public position: Vector, public maxVal: number) {
    const innerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Green });
    const outerRect = new Rectangle({ width: dims.x, height: dims.y, color: Color.Red });

    super({ name: "outerHealthBar", width: dims.x, height: dims.y, pos: position });
    this.graphics.use(outerRect);
    this.percent = 100;

    this.child = new ScreenElement({ name: "innerHealthBar", width: dims.x, height: dims.y, pos: new Vector(0, 0) });
    this.child.graphics.use(innerRect);
    this.addChild(this.child);
  }

  setPercent(percent: number): void {
    this.percent = percent;
    if (this.percent < 0) {
      this.percent = 0;
    }
    if (this.percent > 100) {
      this.percent = 100;
    }

    this.child.scale.x = this.percent / 100;
    this.child.scale.y = 1;
  }
}
