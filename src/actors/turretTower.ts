import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, Engine, Entity, Side, Vector } from "excalibur";
import {
  turretIdleAnimation,
  turretActiveGreenAnimationLeft,
  turretActiveGreenAnimationRight,
  turretActiveRedAnimationLeft,
  turretActiveRedAnimationRight,
} from "../animations/turrentAnimation";
import { ExFSM, ExState } from "../lib/ExFSM";
import { Blast } from "./blast";
import { HealthBar } from "../UI/healthbar";
import { Signal } from "../lib/Signals";
import { UIStore } from "../UI/store";
import { sndPlugin } from "../main";

const fieldShape = new Circle({
  radius: 100,
  color: Color.fromRGB(255, 255, 255, 0.05),
});

export class TurretTower extends Actor {
  animationStates = new ExFSM();
  targets: Entity[] = [];
  fireRate = 100;
  fireTik = 0;
  direction: "right" | "left" = "left";
  hp = 50;
  maxhp = 50;
  healthbar: HealthBar;
  gameOverSignal = new Signal("gameover");
  cost = 25;

  constructor(spawnPosition: Vector, public store: UIStore) {
    super({
      name: "turret",
      x: spawnPosition.x,
      y: spawnPosition.y,
      z: 0,
      collisionType: CollisionType.Passive,
      radius: 12,
    });
    this.scale = new Vector(2, 2);
    this.animationStates.register(new IdleState(this), new OnlineState(this), new AlertState(this));

    // create child actor for 'detection field'
    const detectionField = new Actor({
      name: "field",
      pos: new Vector(0, 0),
      z: 0,
      radius: 100,
      collisionType: CollisionType.Passive,
    });
    detectionField.graphics.use(fieldShape);
    detectionField.onCollisionStart = (self: Collider, other: Collider, side: Side, contact: CollisionContact) => {
      if (
        other.owner.name === "ship" ||
        other.owner.name === "blast" ||
        other.owner.name === "turret" ||
        other.owner.name === "field" ||
        other.owner.name === "UIStore" ||
        other.owner.name === "unitFrame" ||
        other.owner.name === "playingField"
      )
        return;

      this.targets.push(other.owner);
    };
    detectionField.onCollisionEnd = (self: Collider, other: Collider, side: Side, contact: CollisionContact) => {
      if (
        other.owner.name === "ship" ||
        other.owner.name === "blast" ||
        other.owner.name === "turret" ||
        other.owner.name === "field" ||
        other.owner.name === "UIStore" ||
        other.owner.name === "unitFrame" ||
        other.owner.name === "playingField"
      )
        return;
      this.targets = this.targets.filter(t => t !== other.owner);
    };

    this.addChild(detectionField);

    this.healthbar = new HealthBar(new Vector(24, 2), new Vector(-12, -20), 50);
    this.addChild(this.healthbar);
  }
  onInitialize(engine: Engine): void {
    this.animationStates.set("idle");
    setTimeout(() => this.animationStates.set("online"), 1000);
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.healthbar.setPercent((this.hp / this.maxhp) * 100);
    let currentstate = this.animationStates.get();
    if (currentstate.name == "idle") return;

    if (this.targets.length > 0) {
      this.animationStates.set("alert");
    } else {
      this.animationStates.set("online");
    }
    currentstate = this.animationStates.get();
    if (currentstate.name == "online") return;

    //target the zero index of targets
    const nextTarget = this.targets[0];

    //if target is left of me, set direction to left
    if ((nextTarget as Actor).pos.x < this.pos.x) {
      this.direction = "left";
    } else {
      this.direction = "right";
    }

    this.fireTik++;
    if (this.fireTik > this.fireRate) {
      this.fireTik = 0;
      this.fire(this.pos, nextTarget, engine);
    }
    this.animationStates.update();
  }

  fire(startingPosition: Vector, target: Entity, engine: Engine) {
    if (target) {
      sndPlugin.playSound("blast");
      engine.currentScene.add(new Blast(startingPosition, (target as Actor).pos, this.store));
    }
  }
}

class IdleState extends ExState {
  constructor(public enemy: TurretTower) {
    super("idle", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(turretIdleAnimation);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.enemy.graphics.use(turretIdleAnimation);
  }
}

class OnlineState extends ExState {
  direction: "right" | "left" = "left";
  constructor(public enemy: TurretTower) {
    super("online", enemy.animationStates);
    this.direction = enemy.direction;
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(turretActiveGreenAnimationLeft);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.direction = this.enemy.direction;
    if (this.direction == "left") {
      this.enemy.graphics.use(turretActiveGreenAnimationLeft);
    } else {
      this.enemy.graphics.use(turretActiveGreenAnimationRight);
    }
  }
}

class AlertState extends ExState {
  direction: "right" | "left" = "left";
  constructor(public enemy: TurretTower) {
    super("alert", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(turretActiveRedAnimationLeft);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.direction = this.enemy.direction;
    if (this.direction == "left") {
      this.enemy.graphics.use(turretActiveRedAnimationLeft);
    } else {
      this.enemy.graphics.use(turretActiveRedAnimationRight);
    }
  }
}
