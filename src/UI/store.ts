import { Actor, Color, Engine, Font, GraphicsGroup, Label, ScreenElement, Sprite, Vector } from "excalibur";
import { NineSlice, NineSliceConfig, NineSliceStretch } from "./9slice";
import { Resources, sniperTurretSpriteSheet, turretSpriteSheet } from "../resources";
import { Signal } from "../lib/Signals";
import { sndPlugin } from "../main";

const shrunkTurret = turretSpriteSheet.getSprite(0, 0).clone();
shrunkTurret.scale = new Vector(0.5, 0.5);
const shrunkSniper = sniperTurretSpriteSheet.getSprite(0, 0).clone();
shrunkSniper.scale = new Vector(0.5, 0.5);

class UnitFrame extends Actor {
  costlabel: Label;
  availableUnits = [
    { name: "turret", cost: 25, image: shrunkTurret },
    { name: "sniper", cost: 75, image: shrunkSniper },
  ];
  unitIndex = 0;
  gGroup: GraphicsGroup;
  constructor(pos: Vector) {
    super({ name: "unitFrame", x: pos.x, y: pos.y, width: 16, height: 32, z: 1, scale: new Vector(6, 6), anchor: Vector.Zero });
    this.gGroup = new GraphicsGroup({
      members: [Resources.unitFrame.toSprite(), { graphic: this.availableUnits[this.unitIndex].image, offset: new Vector(6, 6) }],
    });

    this.costlabel = new Label({
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
    this.addChild(this.costlabel);

    class leftArrow extends Actor {
      constructor(public owner: UnitFrame) {
        super({ name: "leftArrow", x: -8, y: 4, width: 16, height: 16, z: 1, anchor: Vector.Zero });

        this.graphics.use(Resources.arrow.toSprite());
        this.scale = new Vector(0.45, 0.25);
      }
      onInitialize(engine: Engine): void {
        this.on("pointerup", e => {
          this.owner.decIndex();
          e.cancel();
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
        this.on("pointerup", e => {
          this.owner.incIndex();
          e.cancel();
        });
      }
    }

    this.addChild(new leftArrow(this));
    this.addChild(new rightArrow(this));
  }

  incIndex() {
    this.unitIndex++;
    if (this.unitIndex > this.availableUnits.length - 1) this.unitIndex = 0;
    //@ts-ignore
    this.gGroup.members[1].graphic = this.availableUnits[this.unitIndex].image;
    this.costlabel.text = `Cost: ${this.availableUnits[this.unitIndex].cost}`;
  }

  decIndex() {
    this.unitIndex--;
    if (this.unitIndex < 0) this.unitIndex = this.availableUnits.length - 1;
    //@ts-ignore
    this.gGroup.members[1].graphic = this.availableUnits[this.unitIndex].image;
    this.costlabel.text = `Cost: ${this.availableUnits[this.unitIndex].cost}`;
  }
  onInitialize(engine: Engine): void {
    this.graphics.use(this.gGroup);
  }
}

class WaveTimeRemaining extends Label {
  gameoverSignal = new Signal("gameover");
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

    this.gameoverSignal.listen(() => {
      this.time = 60;
    });
  }

  setTime(newTime: number) {
    this.time = newTime;
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.text = `
    Wave Time 
    Remaining: ${this.time}`;
  }
  enableWaveTimer() {
    this.running = true;
  }

  stopWaveTimer() {
    this.running = false;
  }
}

class RepairShip extends Actor {
  repairShipSignal: Signal = new Signal("repairShip");
  constructor(pos: Vector, public store: UIStore) {
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
  onInitialize(engine: Engine): void {
    this.on("pointerup", e => {
      const currentFunds = this.store.getMoney();
      if (currentFunds >= 100) {
        // repair ship
        sndPlugin.playSound("healship");
        this.repairShipSignal.send();
        this.store.decMoney(100);
      }
      e.cancel();
    });
  }
}

class MoneyLabel extends Label {
  coin = 100;
  gameoverSignal = new Signal("gameover");
  constructor(pos: Vector) {
    super({ name: "moneyLabel", x: pos.x, y: pos.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `Money: ${this.coin}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
    this.gameoverSignal.listen(() => {
      this.coin = 100;
    });
  }

  decrementCoin(amount: number) {
    this.coin -= amount;
    if (this.coin < 0) this.coin = 0;
  }

  incrementCoin(amount: number) {
    this.coin += amount;
  }

  update(engine: Engine, delta: number): void {
    this.text = `Money: ${this.coin}`;
  }
}

class ScoreLabel extends Label {
  score = 0;
  gameoverSignal = new Signal("gameover");
  constructor(pos: Vector) {
    super({ name: "scoreLabel", x: pos.x, y: pos.y, width: 5, height: 50, z: 2, anchor: Vector.Zero });
    this.text = `Score: ${this.score}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
    this.gameoverSignal.listen(() => {
      this.score = 0;
    });
  }

  update(engine: Engine, delta: number): void {
    this.text = `Score: ${this.score}`;
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

  update(engine: Engine, delta: number): void {
    this.text = `
    Enemies
    Left: ${this.enemies}`;
    this.font = new Font({
      size: 36,
      color: Color.White,
      family: "Arial",
    });
  }
}

export class UIStore extends ScreenElement {
  unitFrame: UnitFrame | undefined = undefined;
  moneyChild: MoneyLabel | undefined = undefined;
  timer: WaveTimeRemaining | undefined = undefined;
  score: ScoreLabel | undefined = undefined;
  enemies: WaveEnemiesRemaining | undefined = undefined;
  enemyUpdateTik = 0;
  enemyUpdateLimit = 100;
  constructor(public dims: Vector, public position: Vector) {
    super({ name: "UIStore", x: position.x, y: position.y, width: dims.x, height: dims.y, z: 1, anchor: Vector.Zero });
  }

  onInitialize = (engine: Engine): void => {
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
    this.timer = new WaveTimeRemaining(new Vector(calcWidth / 4 - 80, 400));
    this.addChild(this.timer);
    this.addChild(new RepairShip(new Vector(calcWidth / 2 - 80, 220), this));
    this.moneyChild = new MoneyLabel(new Vector(calcWidth / 2 - 105, 550));
    this.addChild(this.moneyChild);
    this.score = new ScoreLabel(new Vector(calcWidth / 2 - 80, 615));
    this.addChild(this.score);
    this.enemies = new WaveEnemiesRemaining(new Vector(calcWidth / 3 - 80, 670));
    this.addChild(this.enemies);
  };

  getArea() {
    return {
      pos: this.pos,
      width: this.width,
      height: this.height,
    };
  }

  getCurrentTurret(): any {
    if (!this.unitFrame) return "none";
    const currentTurret = this.unitFrame.availableUnits[this.unitFrame.unitIndex];
    return currentTurret;
  }

  setWaveTimer(newval: number) {
    if (!this.timer) return;
    this.timer;
  }

  getMoney() {
    if (!this.moneyChild) return 0;
    return this.moneyChild?.coin;
  }

  decMoney(delta: number) {
    if (!this.moneyChild) return;
    this.moneyChild.decrementCoin(delta);
  }

  incMoney(delta: number) {
    if (!this.moneyChild) return;
    this.moneyChild.incrementCoin(delta);
  }

  incScore(delta: number) {
    if (!this.score) return;
    this.score.score += delta;
  }

  setEnemies(num: number) {
    if (!this.enemies) return;
    this.enemies!.enemies = num;
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.enemyUpdateTik++;
    if (this.enemyUpdateTik >= this.enemyUpdateLimit) {
      this.enemyUpdateTik = 0;
      const enemies = engine.currentScene.entities.filter(e => {
        return e.name === "spawn" || e.name === "enemy";
      });
      const numEnemies = enemies.length;
      this.setEnemies(numEnemies);
    }
  }
}
