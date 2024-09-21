// resources.ts
import { ImageSource, Loader, Sprite, SpriteSheet } from "excalibur";

import shipImage from "./assets/ship-sheet.png";
import firstEnemyImage from "./assets/enemy1.png";
import firstSpawnImage from "./assets/spawn1.png";
import turretImage from "./assets/turret-Sheet.png";
import light1 from "./assets/light_01.png";
import light2 from "./assets/light_02.png";
import light3 from "./assets/light_03.png";

export const Resources = {
  shipImageResource: new ImageSource(shipImage),
  enemy1ImageResource: new ImageSource(firstEnemyImage),
  spawn1ImageResource: new ImageSource(firstSpawnImage),
  turretImageResource: new ImageSource(turretImage),
  light1: new ImageSource(light1),
  light2: new ImageSource(light2),
  light3: new ImageSource(light3),
};

export const shipSpriteSheet = SpriteSheet.fromImageSource({
  image: Resources.shipImageResource,
  grid: {
    rows: 1,
    columns: 4,
    spriteWidth: 96,
    spriteHeight: 96,
  },
});

export const enemy1SpriteSheet = SpriteSheet.fromImageSource({
  image: Resources.enemy1ImageResource,
  grid: {
    rows: 1,
    columns: 4,
    spriteWidth: 24,
    spriteHeight: 24,
  },
});

export const spawn1SpriteSheet = SpriteSheet.fromImageSource({
  image: Resources.spawn1ImageResource,
  grid: {
    rows: 1,
    columns: 4,
    spriteWidth: 24,
    spriteHeight: 24,
  },
});

export const turretSpriteSheet = SpriteSheet.fromImageSource({
  image: Resources.turretImageResource,
  grid: {
    rows: 1,
    columns: 6,
    spriteWidth: 24,
    spriteHeight: 24,
  },
});

export const light1Sprite = new Sprite({
  image: Resources.light1,
  destSize: {
    width: 16,
    height: 16,
  },
});
export const light2Sprite = new Sprite({
  image: Resources.light2,
  destSize: {
    width: 16,
    height: 16,
  },
});
export const light3Sprite = new Sprite({
  image: Resources.light3,
  destSize: {
    width: 16,
    height: 16,
  },
});

export const loader = new Loader();

for (let res of Object.values(Resources)) {
  loader.addResource(res);
}
