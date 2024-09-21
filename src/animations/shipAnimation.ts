import { Animation, AnimationStrategy } from "excalibur";
import { shipSpriteSheet } from "../resources";

export const shipActiveAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: shipSpriteSheet.getSprite(0, 0),
      duration: 80,
    },
    {
      graphic: shipSpriteSheet.getSprite(1, 0),
      duration: 80,
    },
    {
      graphic: shipSpriteSheet.getSprite(2, 0),
      duration: 80,
    },
    {
      graphic: shipSpriteSheet.getSprite(3, 0),
      duration: 80,
    },
  ],
});

export const shipIdleAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: shipSpriteSheet.getSprite(0, 0),
      duration: 80,
    },
  ],
});
