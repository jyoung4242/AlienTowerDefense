import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, Engine, Entity, Side, Vector } from "excalibur";
import { turretActivatingLeft, turretActivatingRight, turretIdleLeft, turretIdleRight } from "../animations/sniperAnimation";
import { ExFSM, ExState } from "../lib/ExFSM";
import { HealthBar } from "../UI/healthbar";
import { Signal } from "../lib/Signals";
import { Blast } from "./blast";

const fieldShape = new Circle({
  radius: 250,
  color: Color.fromRGB(255, 255, 255, 0.1),
});

export class SniperTurret extends Actor {
  animationStates = new ExFSM();
  targets: Entity[] = [];
  fireRate = 250;
  fireTik = 0;
  direction: "right" | "left" = "left";
  hp = 30;
  maxhp = 30;
  healthbar: HealthBar;
  gameOverSignal = new Signal("gameover");
  cost = 75;

  constructor(spawnPosition: Vector) {
    super({
      name: "turret",
      x: spawnPosition.x,
      y: spawnPosition.y,
      z: 0,
      collisionType: CollisionType.Passive,
      radius: 24,
    });
    this.scale = new Vector(2, 2);
    this.animationStates.register(new IdleState(this), new AlertState(this));

    // create child actor for 'detection field'
    const detectionField = new Actor({
      name: "field",
      pos: new Vector(0, 0),
      z: 0,
      radius: 250,
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
        other.owner.name === "unitFrame"
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
        other.owner.name === "unitFrame"
      )
        return;
      this.targets = this.targets.filter(t => t !== other.owner);
    };

    this.addChild(detectionField);

    this.healthbar = new HealthBar(new Vector(24, 2), new Vector(-12, -20), 30);
    this.addChild(this.healthbar);
  }
  onInitialize(engine: Engine): void {
    this.animationStates.set("idle");
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.healthbar.setPercent((this.hp / this.maxhp) * 100);
    if (this.targets.length == 0) return;

    //target the zero index of targets
    const nextTarget = this.targets[0];
    //if target is left of me, set direction to left
    if ((nextTarget as Actor).pos.x < this.pos.x) {
      this.direction = "left";
    } else {
      this.direction = "right";
    }
    this.animationStates.set("alert");

    this.fireTik++;
    if (this.fireTik > this.fireRate) {
      this.fireTik = 0;
      this.fire(this.pos, nextTarget, engine);
    }
    this.animationStates.update();
  }

  fire(startingPosition: Vector, target: Entity, engine: Engine) {
    if (target) {
      engine.currentScene.add(new Blast(startingPosition, (target as Actor).pos));
    }
  }
}

class IdleState extends ExState {
  direction: "right" | "left" = "left";
  constructor(public enemy: SniperTurret) {
    super("idle", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.enemy.graphics.use(turretIdleLeft);
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    this.direction = this.enemy.direction;
    if (this.direction == "left") {
      this.enemy.graphics.use(turretIdleLeft);
    } else {
      this.enemy.graphics.use(turretIdleRight);
    }
  }
}

class AlertState extends ExState {
  animationstate: "active" | "done" = "active";

  direction: "right" | "left" = "left";
  constructor(public enemy: SniperTurret) {
    super("alert", enemy.animationStates);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    let animation;
    if (this.direction == "left") {
      animation = turretActivatingLeft;
    } else {
      animation = turretActivatingRight;
    }
    this.enemy.graphics.use(animation);
    this.animationstate = "active";
    animation.events.on("end", a => {
      this.animationstate = "done";
      console.log("ended");
    });
  }
  exit(_next: ExState | null, ...params: any): void | Promise<void> {}
  update(...params: any): void | Promise<void> {
    if (this.animationstate == "done") return;
    this.direction = this.enemy.direction;
    if (this.direction == "left") {
      this.enemy.graphics.use(turretActivatingLeft);
    } else {
      this.enemy.graphics.use(turretActivatingRight);
    }
  }
}
