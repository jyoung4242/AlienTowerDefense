import { Actor, Collider, CollisionContact, CollisionType, Engine, Graphic, Material, Side, Vector } from "excalibur";
import { blastAnimation } from "../animations/blastAnimation";
import { tintShader } from "../shaders/tint blue";
import { Signal } from "../lib/Signals";
import { UIStore } from "../UI/store";
import { sndPlugin } from "../main";

export class Blast extends Actor {
  speed = 400;
  damage = 5;
  blastMaterial: Material | undefined;
  gameOverSignal = new Signal("gameover");

  constructor(public startingPosition: Vector, public targetPosition: Vector, public store: UIStore) {
    super({
      name: "blast",
      radius: 8,
      pos: startingPosition,
      collisionType: CollisionType.Passive,
    });
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
    this.gameOverSignal.listen(() => this.kill());
  }

  onPreUpdate(engine: Engine, delta: number): void {
    if (this.isOffScreen) {
      this.kill();
    }
    this.graphics.use(blastAnimation);
    this.blastMaterial = engine.graphicsContext.createMaterial({
      name: "outline",
      fragmentSource: tintShader,
    });
    this.graphics.material = this.blastMaterial;
  }

  onCollisionStart = (self: Collider, other: Collider, side: Side, contact: CollisionContact): void => {
    if (other.owner.name === "enemy" || other.owner.name === "spawn") {
      this.kill();
      sndPlugin.playSound("enemyHit");
      //@ts-ignore
      if (other.owner.hp > 0) {
        //@ts-ignore
        other.owner.hp -= this.damage;
        //@ts-ignore
        if (other.owner.hp <= 0) {
          other.owner.kill();

          this.store.incScore(5);
        } else {
          this.store.incScore(1);
        }
      }
    }
  };
}
