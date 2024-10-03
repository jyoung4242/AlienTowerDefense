import { Actor, Collider, CollisionContact, CollisionType, Engine, Graphic, Material, Side, Vector } from "excalibur";
import { blastAnimation } from "../animations/blastAnimation";
import { tintShader } from "../shaders/tint";
import { Signal } from "../lib/Signals";
import { UIStore } from "../UI/store";
import { sndPlugin } from "../main";

export class Blast extends Actor {
  speed = 250;
  damage = 2;
  blastMaterial: Material | undefined;
  gameOverSignal = new Signal("gameover");
  returnToPoolSignal = new Signal("returnEnemyToPool");
  lifespan = 1100;
  lifetik = 0;

  constructor(public startingPosition: Vector, public targetPosition: Vector, public store: UIStore) {
    super({
      name: "blast",
      radius: 8,
      pos: startingPosition,
      collisionType: CollisionType.Passive,
    });
  }

  reset(position: Vector, target: Vector) {
    this.startingPosition = position;
    this.targetPosition = target;
    this.pos = position;
    const nextPosition = this.pos.sub(this.targetPosition).negate().normalize().scale(this.speed);
    this.vel = nextPosition;
    this.lifetik = 0;
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(blastAnimation);
    const nextPosition = this.pos.sub(this.targetPosition).negate().normalize().scale(this.speed);
    this.vel = nextPosition;
    this.blastMaterial = engine.graphicsContext.createMaterial({
      name: "outline",
      fragmentSource: tintShader,
    });
    this.graphics.material = this.blastMaterial;
    this.gameOverSignal.listen(() => {
      if (this.scene) this.scene.remove(this);
      //this.kill();
    });
  }

  onPreUpdate(engine: Engine, delta: number): void {
    if (this.isOffScreen) {
      //this.kill();
      if (this.scene) this.scene.remove(this);
    }
    this.graphics.use(blastAnimation);
    this.lifetik += delta;
    if (this.lifetik > this.lifespan) {
      if (this.scene) this.scene.remove(this);
    }
  }

  onCollisionStart = (self: Collider, other: Collider, side: Side, contact: CollisionContact): void => {
    if (other.owner.name === "enemy" || other.owner.name === "spawn") {
      //this.kill();
      if (this.scene) this.scene.remove(this);
      sndPlugin.playSound("enemyHit");
      //@ts-ignore
      if (other.owner.hp > 0) {
        //@ts-ignore
        other.owner.hp -= this.damage;
        //@ts-ignore
        if (other.owner.hp <= 0) {
          if (other.owner.scene) other.owner.scene.remove(other.owner);
          this.returnToPoolSignal.send([other.owner]);
          this.store.incScore(5);
        } else {
          this.store.incScore(1);
        }
      }
    }
  };
}
