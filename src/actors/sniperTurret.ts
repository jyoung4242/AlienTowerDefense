import { Actor, Circle, Collider, CollisionContact, CollisionType, Color, Engine, Entity, Side, Vector } from "excalibur";
import { turretActivatingLeft, turretActivatingRight, turretIdleLeft, turretIdleRight } from "../animations/sniperAnimation";
import { ExFSM, ExState } from "../lib/ExFSM";
import { HealthBar } from "../UI/healthbar";
import { Signal } from "../lib/Signals";
import { Blast } from "./blast blue";
import { UIStore } from "../UI/store";

const fieldShape = new Circle({
  radius: 250,
  color: Color.fromRGB(255, 255, 255, 0.05),
});

export class SniperTurret extends Actor {
  animationStates = new ExFSM();
  targets: Entity[] = [];
  fireRate = 200;
  fireTik = 0;
  direction: "right" | "left" = "left";
  hp = 30;
  maxhp = 30;
  healthbar: HealthBar;
  gameOverSignal = new Signal("gameover");
  cost = 75;

  constructor(spawnPosition: Vector, public store: UIStore) {
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
      if (other.owner.name === "enemy" || other.owner.name === "spawn") this.targets.push(other.owner);
    };
    detectionField.onCollisionEnd = (self: Collider, other: Collider, side: Side, contact: CollisionContact) => {
      if (other.owner.name === "enemy" || other.owner.name === "spawn") this.targets = this.targets.filter(t => t !== other.owner);
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
    if (this.targets.length == 0) {
      this.animationStates.set("idle");
      return;
    }

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
      console.log(target);

      const predictedPosition = getPredictedPosition((target as Actor).pos, (target as Actor).vel, this.pos, 200);
      engine.currentScene.add(new Blast(startingPosition, predictedPosition as Vector, this.store));
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

function getPredictedPosition(enemyPos: Vector, enemyVel: Vector, towerPos: Vector, laserSpeed: number): Vector | null {
  // Get the distance between the tower and the enemy
  const distance = towerPos.distance(enemyPos);

  // If the laser speed is too slow, don't bother calculating
  if (laserSpeed <= 0) return null;

  // Calculate the time for the laser to reach the enemy's current position
  const timeToImpact = distance / laserSpeed;

  // Predict the future position of the enemy
  const futureX = enemyPos.x + enemyVel.x * timeToImpact;
  const futureY = enemyPos.y + enemyVel.y * timeToImpact;

  return new Vector(futureX, futureY);
}
