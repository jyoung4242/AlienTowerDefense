import { Actor, Engine, Vector } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { enemyIdleAnimation, enemyActiveAnimation } from "../animations/enemyAnimation";
import { firstSpawn } from "./firstSpawn";
import { Signal } from "../lib/Signals";
import { HealthBar } from "../UI/healthbar";

export class firstEnemy extends Actor {
  healthBar: HealthBar;
  animationStates = new ExFSM();
  distanceToCenter = 500;
  direction: "CCW" | "CW" = "CW";
  hp: number = 10;
  maxHP: number = 10;
  angVelocity = 0.001;
  currentAngle = 0;
  anchorPoint = new Vector(0, 0);
  spawnTrigger = 250;
  spawnTiks = 0;
  gameOverSignal = new Signal("gameover");

  constructor(targetPos: Vector, public screenHeight: number) {
    super({
      name: "enemy",
      radius: 12,
      pos: new Vector(targetPos.x + 800, targetPos.y),
    });
    this.anchorPoint = targetPos;
    this.animationStates.register(new idleState(this), new activeState(this));
    this.animationStates.set("active");
    this.scale = new Vector(2, 2);
    this.healthBar = new HealthBar(new Vector(25, 2), new Vector(-12.5, -15), 10);
    this.addChild(this.healthBar);
    console.log(this.screenHeight);

    this.distanceToCenter = this.screenHeight / 2 - 50;
  }

  onInitialize(engine: Engine): void {
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.healthBar.setPercent((this.hp / this.maxHP) * 100);
    if (this.direction === "CW") {
      this.currentAngle += this.angVelocity; // Move clockwise
    } else {
      this.currentAngle -= this.angVelocity; // Move counter-clockwise
    }
    this.getNextPoint();
    this.spawnTiks++;

    if (this.spawnTiks > this.spawnTrigger) {
      this.spawnTiks = 0;
      const newSpawn = new firstSpawn(this.pos);
      engine.currentScene.add(newSpawn);
    }
  }

  getNextPoint() {
    this.pos.x = this.anchorPoint.x + this.distanceToCenter * Math.cos(this.currentAngle);
    this.pos.y = this.anchorPoint.y + this.distanceToCenter * Math.sin(this.currentAngle);
  }
}

class idleState extends ExState {
  constructor(public enemy: firstEnemy) {
    super("idle", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(enemyIdleAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.enemy.graphics.use(enemyIdleAnimation);
  }
}

class activeState extends ExState {
  constructor(public enemy: firstEnemy) {
    super("active", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(enemyActiveAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.enemy.graphics.use(enemyActiveAnimation);
  }
}
