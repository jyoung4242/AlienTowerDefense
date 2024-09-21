import { Animation, AnimationStrategy } from "excalibur";
import { spawn1SpriteSheet } from "../resources";

export const spawnActiveAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: spawn1SpriteSheet.getSprite(0, 0),
      duration: 80,
    },
    {
      graphic: spawn1SpriteSheet.getSprite(1, 0),
      duration: 80,
    },
    {
      graphic: spawn1SpriteSheet.getSprite(2, 0),
      duration: 80,
    },
    {
      graphic: spawn1SpriteSheet.getSprite(3, 0),
      duration: 80,
    },
  ],
});

export const spawnIdleAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: spawn1SpriteSheet.getSprite(0, 0),
      duration: 80,
    },
  ],
});
