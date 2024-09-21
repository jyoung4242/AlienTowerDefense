import { Animation, AnimationStrategy } from "excalibur";
import { light1Sprite, light2Sprite, light3Sprite } from "../resources";

export const blastAnimation = new Animation({
  strategy: AnimationStrategy.Loop,
  frames: [
    {
      graphic: light1Sprite,
      duration: 80,
    },
    {
      graphic: light2Sprite,
      duration: 80,
    },
    {
      graphic: light3Sprite,
      duration: 80,
    },
  ],
});
