import { Color, Engine, Font, Label, ScreenElement, Vector } from "excalibur";
import { Signal } from "../lib/Signals";

export class Banner extends ScreenElement {
  startSignal = new Signal("startwave");
  textChild;
  visible = true;

  constructor(engine: Engine) {
    const screenArea = engine.screen.contentArea;
    super({
      name: "banner",
      width: screenArea.width,
      height: 75,
      x: 0,
      y: 0,
      z: 5,
      anchor: Vector.Zero,
      color: Color.Black,
    });

    this.graphics.opacity = 1.0;
    this.textChild = new Label({
      name: "wavelabel",
      text: "READY TO START!",
      width: 200,
      height: 7,
      x: screenArea.width / 2 - 100,
      y: 5,
      z: 8,
      font: new Font({
        size: 36,
        color: Color.White,
        family: "Arial",
      }),
    });
    this.textChild.opacity = 1.0;
    this.addChild(this.textChild);
  }
  onInitialize(engine: Engine): void {
    this.startSignal.listen(() => {
      this.visible = true;
      this.setText("Wave: ", 1);
      setTimeout(() => {
        this.visible = false;
      }, 1500);
    });
  }

  showBanner() {
    this.visible = true;
  }
  hideBanner() {
    this.visible = false;
  }

  setText(text: string, value?: number) {
    if (text === "Wave: ") this.textChild.text = `Wave: ${value}`;
    else this.textChild.text = `${text}`;
  }

  update(engine: Engine, delta: number): void {
    if (this.visible) {
      if (this.graphics.opacity < 1) {
        this.graphics.opacity += 0.01;
        this.textChild.opacity += 0.01;
      }
    } else {
      if (this.graphics.opacity > 0) {
        this.graphics.opacity -= 0.01;
        this.textChild.opacity -= 0.01;
      }
    }
  }
}
