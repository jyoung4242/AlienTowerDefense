import { Actor, Color, Engine, Font, Label, ScreenElement, Vector, Text } from "excalibur";
import { Resources } from "../resources";
import { NineSlice, NineSliceConfig, NineSliceStretch } from "./9slice";
import { Signal } from "../lib/Signals";

const ENTRY_TEXT = `Protect your ship! Aliens are coming! 
Each wave that passes will bring 
additional challenges! 
Touch the screen to place the turret.`;

class StartButton extends ScreenElement {
  startWaveSignal = new Signal("startwave");
  constructor(public owner: ScreenElement) {
    super({
      name: "startButton",
      width: 150,
      height: 60,
      x: 225,
      y: 200,
      z: 4,
      anchor: Vector.Zero,
      color: Color.Green,
    });
    class startLabel extends Label {
      constructor() {
        super({
          text: "Start",
          pos: new Vector(45, 18),
          z: 5,
          font: new Font({
            size: 56,
            color: Color.ExcaliburBlue,
            family: "Arial",
          }),
          scale: new Vector(0.5, 0.5),
        });
      }
    }

    this.addChild(new startLabel());
  }

  onInitialize(engine: Engine): void {
    this.on("pointerup", e => {
      this.startWaveSignal.send();
      if (this.owner) (this.owner as StartingModal).closeModal();
      e.cancel();
    });
  }
}

export class StartingModal extends ScreenElement {
  constructor(engine: Engine) {
    const contentArea = engine.screen.contentArea;
    super({ name: "startingModal", width: 600, height: 300, x: contentArea.width / 2 - 200, y: contentArea.height / 2 - 150, z: 3 });
    const config9slice: NineSliceConfig = {
      source: Resources.frame,
      width: 600,
      height: 300,
      sourceConfig: {
        width: 96,
        height: 64,
        topMargin: 4,
        leftMargin: 3,
        bottomMargin: 4,
        rightMargin: 3,
      },
      destinationConfig: {
        drawCenter: true,
        stretchH: NineSliceStretch.TileFit,
        stretchV: NineSliceStretch.TileFit,
      },
    };
    const graphic9slice = new NineSlice(config9slice);
    this.graphics.use(graphic9slice);

    this.addChild(
      new Label({
        font: new Font({
          size: 36,
          color: Color.White,
          family: "Arial",
        }),
        text: ENTRY_TEXT,
        pos: new Vector(10, 10),
        z: 4,
      })
    );

    this.addChild(new StartButton(this));
  }

  closeModal() {
    this.kill();
  }
}
