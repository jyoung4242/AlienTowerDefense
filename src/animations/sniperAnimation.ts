import { Animation, AnimationStrategy } from "excalibur";
import { sniperTurretSpriteSheet } from "../resources";

export const turretActivatingLeft = new Animation({
  strategy: AnimationStrategy.Freeze,
  frames: [
    {
      graphic: sniperTurretSpriteSheet.getSprite(4, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(5, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(6, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(7, 0),
      duration: 150,
    },
  ],
});

export const turretActivatingRight = new Animation({
  strategy: AnimationStrategy.Freeze,
  frames: [
    {
      graphic: sniperTurretSpriteSheet.getSprite(3, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(2, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(1, 0),
      duration: 150,
    },
    {
      graphic: sniperTurretSpriteSheet.getSprite(0, 0),
      duration: 150,
    },
  ],
});

export const turretIdleLeft = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: sniperTurretSpriteSheet.getSprite(3, 0),
      duration: 150,
    },
  ],
});

export const turretIdleRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: sniperTurretSpriteSheet.getSprite(4, 0),
      duration: 150,
    },
  ],
});
