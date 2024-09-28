import { Actor, Collider, CollisionContact, CollisionType, Engine, Random, Side, Vector } from "excalibur";
import { HealthBar } from "../UI/healthbar";
import { ExFSM, ExState } from "../lib/ExFSM";
import { enemyIdleAnimation, enemyActiveAnimation } from "../animations/enemy2Animation";
import { firstEnemy } from "./firstEnemy";
import { angleToRads } from "../lib/utils";
import { Signal } from "../lib/Signals";
import { gameover } from "../scene";
import { sndPlugin } from "../main";

export class Enemy2 extends Actor {
  rng = new Random(Date.now());
  hp = 75;
  maxhp = 75;
  speed = 20;
  damage = 50;
  distance = 0;
  angle = 0;
  targetPos: Vector;

  animationStates = new ExFSM();
  healthbar: HealthBar;
  gameOverSignal = new Signal("gameover");

  constructor(position: Vector) {
    super({
      name: "enemy",
      radius: 16,
      collisionType: CollisionType.Passive,
    });
    console.log("enemy id: ", this.id);

    console.log("enemy id: ", this.id, "target position: ", position);
    this.scale = new Vector(2.5, 2.5);
    this.angle = this.rng.floating(0.0, 2.0);
    this.targetPos = position.clone();
    this.animationStates.register(new idleState(this), new activeState(this));
    this.animationStates.set("active");
    this.healthbar = new HealthBar(new Vector(25, 2), new Vector(-12.5, -15), 75);
    this.addChild(this.healthbar);
  }

  onInitialize(engine: Engine): void {
    const screenHeight = engine.screen.contentArea.height;
    this.distance = screenHeight / 2 - this.rng.integer(0, 60);
    const posx = this.distance * Math.cos(this.angle);
    const posy = this.distance * Math.sin(this.angle);
    console.log("enemy id: ", this.id, "angle: ", this.angle);
    console.log("enemy id: ", this.id, `posx: ${posx}, posy: ${posy}`);
    console.log("enemy id: ", this.id, "position before", this.pos);

    this.pos = this.targetPos.add(new Vector(posx, posy));
    console.log("enemy id: ", this.id, "position after", this.pos);
    const nextPosition = this.pos.sub(this.targetPos).negate().normalize().scale(this.speed);
    this.vel = nextPosition;
    console.log("enemy id: ", this.id, "vel: ", this.vel);

    this.gameOverSignal.listen(() => this.kill());
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner.name === "blast" || other.owner.name === "blast blue") {
      //@ts-ignore
      this.hp -= other.owner.damage;
    }

    if (other.owner.name === "turret") {
      sndPlugin.playSound("turretexplosion");
      this.hp -= 5;
      //@ts-ignore
      other.owner.hp -= this.damage;
      //@ts-ignore
      if (other.owner.hp <= 0) {
        other.owner.kill();
      }
    }

    if (other.owner.name === "ship") {
      sndPlugin.playSound("shipExplosion");
      //@ts-ignore
      other.owner.hp -= this.damage;
      this.kill();
      //@ts-ignore
      if (other.owner.hp <= 0) {
        other.owner.kill();
        gameover();
      }
    }

    if (this.hp <= 0) {
      this.kill();
    }
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.healthbar.setPercent((this.hp / this.maxhp) * 100);
    this.animationStates.update();
  }
}

class idleState extends ExState {
  constructor(public enemy: Enemy2) {
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
  constructor(public enemy: Enemy2) {
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
