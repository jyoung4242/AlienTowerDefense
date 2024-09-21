import { Actor, Collider, CollisionContact, CollisionType, Engine, Side, Vector } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { shipActiveAnimation, shipIdleAnimation } from "../animations/shipAnimation";
import { HealthBar } from "../UI/healthbar";
import { Signal } from "../lib/Signals";

export class Ship extends Actor {
  gameOverSignal = new Signal("gameover");
  healthbar: HealthBar;
  hp = 100;
  maxHP = 100;
  animationStates = new ExFSM();
  constructor() {
    super({
      name: "ship",
      radius: 96 / 2,
      z: 1,
      x: 100,
      y: 50,
      pos: new Vector(0, 0),
      collisionType: CollisionType.Active,
    });

    this.animationStates.register(new idleState(this), new activeState(this));
    this.animationStates.set("active");
    this.healthbar = new HealthBar(new Vector(100, 10), new Vector(-50, -60), 100);
    this.addChild(this.healthbar);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}

  onInitialize(engine: Engine): void {
    engine.currentScene.camera.strategy.lockToActor(this);
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.healthbar.setPercent((this.hp / this.maxHP) * 100);
  }
  reset() {
    this.hp = 100;
    this.healthbar.setPercent((this.hp / this.maxHP) * 100);
  }
}

class idleState extends ExState {
  constructor(public ship: Ship) {
    super("idle", ship.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.ship.graphics.use(shipIdleAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.ship.graphics.use(shipIdleAnimation);
  }
}
class activeState extends ExState {
  constructor(public ship: Ship) {
    super("active", ship.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.ship.graphics.use(shipActiveAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.ship.graphics.use(shipActiveAnimation);
  }
}

export const playerShip = new Ship();
