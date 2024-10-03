import { Actor, Collider, CollisionContact, CollisionType, Engine, Random, Side, Vector } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { enemyIdleAnimation, enemyActiveAnimation } from "../animations/enemyAnimation";
import { firstSpawn } from "./firstSpawn";
import { Signal } from "../lib/Signals";
import { HealthBar } from "../UI/healthbar";
import { sndPlugin } from "../main";
import { angleToRads } from "../lib/utils";
import { MainScene } from "../scene";
import { SniperTurret } from "./sniperTurret";
import { TurretTower } from "./turretTower";

export class firstEnemy extends Actor {
  rng = new Random();
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
  speed = 20;
  returnToPoolSignal = new Signal("returnToPool");
  returnEnemyToPoolSignal = new Signal("returnEnemyToPool");

  constructor(targetPos: Vector, public screenHeight: number, public level?: number) {
    super({
      name: "enemy",
      radius: 12,
      pos: new Vector(targetPos.x + 800, targetPos.y),
      collisionType: CollisionType.Passive,
    });
    this.currentAngle = this.rng.integer(0, 360);
    this.anchorPoint = targetPos;
    this.animationStates.register(new idleState(this), new activeState(this));
    this.animationStates.set("active");
    this.scale = new Vector(2, 2);
    this.healthBar = new HealthBar(new Vector(25, 2), new Vector(-12.5, -15), 10);
    this.addChild(this.healthBar);

    if (this.rng.bool()) {
      this.direction = "CCW";
    } else this.direction = "CW";
    this.angVelocity = this.rng.floating(0.0005, 0.0015);
    if (this.level) {
      this.spawnTrigger = 250 - this.level * 2.5;
    }

    this.distanceToCenter = this.screenHeight / 2 - this.rng.integer(0, 60);
    this.pos.x = this.distanceToCenter * Math.cos(angleToRads(this.currentAngle)) + targetPos.x;
    this.pos.y = this.distanceToCenter * Math.sin(angleToRads(this.currentAngle)) + targetPos.y;
  }

  onInitialize(engine: Engine): void {
    this.gameOverSignal.listen(() => {
      if (this.scene) this.scene.remove(this);
      this.returnEnemyToPoolSignal.send([this]);
    });
  }

  setNewPosition(targetPosition: Vector, level: number) {
    console.log("new position: ", targetPosition);
    this.currentAngle = this.rng.integer(0, 360);
    this.anchorPoint = targetPosition;
    this.level = level;
    this.spawnTrigger = 250 - this.level * 2.5;
    this.distanceToCenter = this.screenHeight / 2 - this.rng.integer(0, 60);
    console.log("distance: ", this.distanceToCenter);
    this.pos.x = this.distanceToCenter * Math.cos(angleToRads(this.currentAngle)) + targetPosition.x;
    this.pos.y = this.distanceToCenter * Math.sin(angleToRads(this.currentAngle)) + targetPosition.y;
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner.name == "turret") {
      this.hp -= 3;
      //@ts-ignore
      other.owner.hp -= 20;
      sndPlugin.playSound("turretexplosion");
      if (this.hp <= 0) {
        if (this.scene) this.scene.remove(this);
        this.returnEnemyToPoolSignal.send([this]);
      }
      //@ts-ignore
      if (other.owner.hp <= 0) {
        //remove from scene
        if (other.owner.scene) other.owner.scene.remove(other.owner);
        this.returnToPoolSignal.send([other.owner]);
      }
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.animationStates.update();
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
      sndPlugin.playSound("spawn");
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
