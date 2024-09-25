import { Actor, Color, Engine, Font, GraphicsGroup, Label, ScreenElement, Sprite, Vector } from "excalibur";
import { NineSlice, NineSliceConfig, NineSliceStretch } from "./9slice";
import { Resources, sniperTurretSpriteSheet, turretSpriteSheet } from "../resources";

const shrunkTurret = turretSpriteSheet.getSprite(0, 0).clone();
shrunkTurret.scale = new Vector(0.5, 0.5);
const shrunkSniper = sniperTurretSpriteSheet.getSprite(0, 0).clone();
shrunkSniper.scale = new Vector(0.5, 0.5);

class UnitFrame extends Actor {
  availableUnits = [
    { name: "turret", cost: 25, image: shrunkTurret },
    { name: "sniper", cost: 50, image: shrunkSniper },
  ];
  unitIndex = 0;
  gGroup: GraphicsGroup;
  constructor(pos: Vector) {
    super({ name: "unitFrame", x: pos.x, y: pos.y, width: 16, height: 32, z: 1, scale: new Vector(6, 6), anchor: Vector.Zero });
    this.gGroup = new GraphicsGroup({
      members: [Resources.unitFrame.toSprite(), { graphic: this.availableUnits[this.unitIndex].image, offset: new Vector(6, 6) }],
    });

    const costLabel = new Label({
      text: `Cost: 25`,
      pos: new Vector(3, 26),
      z: 2,
      font: new Font({
        size: 15,
        color: Color.White,
        family: "Arial",
      }),
      scale: new Vector(0.3, 0.3),
    });
    this.addChild(costLabel);

    class leftArrow extends Actor {
      constructor(public owner: UnitFrame) {
        super({ name: "leftArrow", x: -8, y: 4, width: 16, height: 16, z: 1, anchor: Vector.Zero });

        this.graphics.use(Resources.arrow.toSprite());
        this.scale = new Vector(0.45, 0.25);
      }
      onInitialize(engine: Engine): void {
        this.on("pointerup", e => {
          console.log("clicked");
          this.owner.decIndex();
        });

        this.on("pointerdown", () => {
          console.log("click down");
        });
      }
    }

    class rightArrow extends Actor {
      constructor(public owner: UnitFrame) {
        super({ name: "rightArrow", x: 25, y: 4, width: 16, height: 16, z: 1, anchor: Vector.Zero });
        const rightSprite = Resources.arrow.toSprite().clone();
        rightSprite.flipHorizontal = true;
        this.graphics.use(rightSprite);
        this.scale = new Vector(0.45, 0.25);
      }

      onInitialize(engine: Engine): void {
        this.on("pointerup", () => this.owner.incIndex());
      }
    }

    this.addChild(new leftArrow(this));
    this.addChild(new rightArrow(this));
  }

  incIndex() {
    this.unitIndex++;
    if (this.unitIndex > this.availableUnits.length - 1) this.unitIndex = 0;
  }

  decIndex() {
    this.unitIndex--;
    if (this.unitIndex < 0) this.unitIndex = this.availableUnits.length - 1;
  }
  onInitialize(engine: Engine): void {
    this.graphics.use(this.gGroup);
  }
}

class WaveTimeRemaining extends Label {
  time = 60;
  running = false;
  callback = () => {
    window.alert("wave over");
  };
  intervalHandler: any;
  constructor(public position: Vector) {
    super({ name: "waveTimeRemaining", x: position.x, y: position.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `
    Wave Time 
    Remaining: ${this.time}`;

    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });

    this.intervalHandler = setInterval(this.tikTime.bind(this), 1000);
  }

  tikTime() {
    if (!this.running) return;
    this.time--;
    if (this.time == 0) this.callback();
  }

  setTime(newTime: number) {
    this.time = newTime;
  }

  enableWaveTimer() {
    this.running = true;
  }

  stopWaveTimer() {
    this.running = false;
  }
}

class RepairShip extends Actor {
  constructor(pos: Vector) {
    super({ name: "repairShip", x: pos.x, y: pos.y, width: 16, height: 32, z: 1, scale: new Vector(6, 6), anchor: Vector.Zero });
    this.graphics.use(Resources.unitFrameShip.toSprite());
    const costLabel = new Label({
      text: `Cost: 100`,
      pos: new Vector(3, 26),
      z: 2,
      font: new Font({
        size: 15,
        color: Color.White,
        family: "Arial",
      }),
      scale: new Vector(0.3, 0.3),
    });
    this.addChild(costLabel);
  }
}

class MoneyLabel extends Label {
  coin = 100;
  constructor(pos: Vector) {
    super({ name: "moneyLabel", x: pos.x, y: pos.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `Money: ${this.coin}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
  }

  decrementCoin(amount: number) {
    this.coin -= amount;
  }

  update(engine: Engine, delta: number): void {
    this.text = `Money: ${this.coin}`;
  }
}

class ScoreLabel extends Label {
  score = 0;
  constructor(pos: Vector) {
    super({ name: "scoreLabel", x: pos.x, y: pos.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `Score: ${this.score}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
  }
}

class WaveEnemiesRemaining extends Label {
  enemies = 0;
  constructor(pos: Vector) {
    super({ name: "waveEnemiesRemaining", x: pos.x, y: pos.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `
    Enemies
    Left: ${this.enemies}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
  }

  update(engine: Engine, delta: number): void {}
}

export class UIStore extends ScreenElement {
  unitFrame: UnitFrame | undefined = undefined;
  constructor(public dims: Vector, public position: Vector) {
    super({ name: "UIStore", x: position.x, y: position.y, width: dims.x, height: dims.y, z: 1, anchor: Vector.Zero });
  }

  onInitialize(engine: Engine): void {
    const screenArea = engine.screen.contentArea;
    const calcWidth = screenArea.width * 0.15;

    const config9slice: NineSliceConfig = {
      source: Resources.frame,
      width: calcWidth,
      height: screenArea.height,
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
    this.unitFrame = new UnitFrame(new Vector(calcWidth / 2 - 80, 10));
    this.addChild(this.unitFrame);
    this.addChild(new WaveTimeRemaining(new Vector(calcWidth / 4 - 80, 400)));
    this.addChild(new RepairShip(new Vector(calcWidth / 2 - 80, 220)));
    this.addChild(new MoneyLabel(new Vector(calcWidth / 2 - 105, 550)));
    this.addChild(new ScoreLabel(new Vector(calcWidth / 2 - 80, 615)));
    this.addChild(new WaveEnemiesRemaining(new Vector(calcWidth / 3 - 80, 670)));
  }

  getArea() {
    return {
      pos: this.pos,
      width: this.width,
      height: this.height,
    };
  }

  getCurrentTurret(): string {
    if (!this.unitFrame) return "none";
    return this.unitFrame.availableUnits[this.unitFrame.unitIndex].name;
  }
}

export const myUIStore = new UIStore(new Vector(200, 500), new Vector(0, 0));
