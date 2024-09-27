import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, Engine, Side, Vector } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { spawnActiveAnimation, spawnIdleAnimation } from "../animations/spawnAnimation";
import { playerShip, Ship } from "./ship";
import { gameover } from "../scene";
import { TurretTower } from "./turretTower";
import { Signal } from "../lib/Signals";
import { sndPlugin } from "../main";

const fieldShape = new Circle({
  radius: 200,
  color: Color.fromRGB(255, 255, 255, 0.1),
});

export class firstSpawn extends Actor {
  animationStates = new ExFSM();
  gameOverSignal = new Signal("gameover");
  cameraShakeSignal = new Signal("cameraShake");
  speed: number = 60;
  hp: number = 5;
  damage: number = 20;
  target: Ship | TurretTower | undefined;

  constructor(startingposition: Vector) {
    super({
      name: "spawn",
      radius: 12,
      pos: startingposition,
      collisionType: CollisionType.Active,
      z: 0,
    });

    this.animationStates.register(new idleState(this), new activeState(this));
    this.animationStates.set("active");
    this.scale = new Vector(1, 1);

    const field = new Actor({
      name: "field",
      pos: new Vector(0, 0),
      z: 0,
      radius: 200,
      collisionType: CollisionType.Passive,
    });

    //field.graphics.use(fieldShape);
    field.onCollisionStart = (self: Collider, other: Collider, side: Side, contact: CollisionContact) => {
      if (other.owner.name === "turret") {
        const nextPosition = this.pos
          .sub((other.owner as TurretTower).pos)
          .negate()
          .normalize()
          .scale(this.speed);
        this.vel = nextPosition;
      }
    };

    field.onCollisionEnd = (self: Collider, other: Collider, side: Side, contact: CollisionContact) => {
      if (other.owner.name === "turret") {
        const nextPosition = this.pos.sub(playerShip.pos).negate().normalize().scale(this.speed);
        this.vel = nextPosition;
      }
    };

    this.addChild(field);
  }

  onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner.name === "ship") {
      (other.owner as Ship).hp -= this.damage;
      sndPlugin.playSound("shipExplosion");
      this.kill();
      this.cameraShakeSignal.send();

      if ((other.owner as Ship).hp <= 0) {
        other.owner.kill();
        gameover();
      }
    } else if (other.owner.name === "turret") {
      (other.owner as TurretTower).hp -= this.damage;

      sndPlugin.playSound("turretexplosion");
      this.kill();
      if ((other.owner as TurretTower).hp <= 0) {
        other.owner.kill();
      }
    }
  }

  onInitialize(engine: Engine): void {
    const nextPosition = this.pos.sub(playerShip.pos).negate().normalize().scale(this.speed);
    this.vel = nextPosition;
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {}
}

class idleState extends ExState {
  constructor(public enemy: firstSpawn) {
    super("idle", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(spawnIdleAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.enemy.graphics.use(spawnIdleAnimation);
  }
}

class activeState extends ExState {
  constructor(public enemy: firstSpawn) {
    super("active", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(spawnActiveAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.enemy.graphics.use(spawnActiveAnimation);
  }
}
