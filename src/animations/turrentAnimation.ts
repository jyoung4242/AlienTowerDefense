import { Animation, AnimationStrategy } from "excalibur";
import { turretSpriteSheet } from "../resources";

export const turretActiveGreenAnimationLeft = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: turretSpriteSheet.getSprite(0, 0),
      duration: 150,
    },
    {
      graphic: turretSpriteSheet.getSprite(1, 0),
      duration: 150,
    },
  ],
});

export const turretActiveRedAnimationLeft = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: turretSpriteSheet.getSprite(0, 0),
      duration: 150,
    },
    {
      graphic: turretSpriteSheet.getSprite(2, 0),
      duration: 150,
    },
  ],
});

export const turretActiveGreenAnimationRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: turretSpriteSheet.getSprite(3, 0),
      duration: 150,
    },
    {
      graphic: turretSpriteSheet.getSprite(4, 0),
      duration: 150,
    },
  ],
});

export const turretActiveRedAnimationRight = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: turretSpriteSheet.getSprite(3, 0),
      duration: 150,
    },
    {
      graphic: turretSpriteSheet.getSprite(5, 0),
      duration: 150,
    },
  ],
});

export const turretIdleAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: turretSpriteSheet.getSprite(0, 0),
      duration: 200,
    },
  ],
});
