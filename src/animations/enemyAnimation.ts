import { Animation, AnimationStrategy } from "excalibur";
import { enemy1SpriteSheet } from "../resources";

export const enemyActiveAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: enemy1SpriteSheet.getSprite(0, 0),
      duration: 80,
    },
    {
      graphic: enemy1SpriteSheet.getSprite(1, 0),
      duration: 80,
    },
    {
      graphic: enemy1SpriteSheet.getSprite(2, 0),
      duration: 80,
    },
    {
      graphic: enemy1SpriteSheet.getSprite(3, 0),
      duration: 80,
    },
  ],
});

export const enemyIdleAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: enemy1SpriteSheet.getSprite(0, 0),
      duration: 80,
    },
  ],
});
