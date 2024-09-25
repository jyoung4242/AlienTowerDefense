import { Camera, Engine, Scene, SceneActivationContext } from "excalibur";
import { WaveSystem } from "./systems/wave";
import { TurretTower } from "./actors/turretTower";
import { decMoney, getMoney } from "./UI/UI";
import { Signal } from "./lib/Signals";
import { myUIStore } from "./UI/store";

class MainScene extends Scene {
  waveManager: WaveSystem;
  cameraShakeSignal = new Signal("cameraShake");
  constructor() {
    super();
    this.waveManager = new WaveSystem(this);
    this.waveManager.initialize();
  }

  onInitialize(engine: Engine): void {
    this.waveManager.reset();

    this.input.pointers.on("down", e => {
      if (this.waveManager.state.get().name == "idle") return;
      //check if click is below store
      let clickPos = e.worldPos;
      let screenPos = e.screenPos;
      // get store position
      let uiPos = myUIStore.getArea();
      console.log("click data", uiPos, clickPos, screenPos);

      if (
        e.screenPos.x > uiPos.pos.x &&
        e.screenPos.x < uiPos.pos.x + uiPos.width &&
        e.screenPos.y > uiPos.pos.y &&
        e.screenPos.y < uiPos.pos.y + uiPos.height
      ) {
        console.log("clicked on store");
        return;
      }

      if (getMoney() >= 25) {
        decMoney(25);
        this.add(new TurretTower(e.worldPos));
      }
    });

    this.cameraShakeSignal.listen(() => {
      this.camera.shake(5, 5, 0.75);
    });
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.waveManager.update(engine);
  }

  gameover() {
    this.waveManager.gameover();
  }
}

export const mainScene = new MainScene();

export function startWave() {
  mainScene.waveManager.startWave();
}

export function gameover() {
  mainScene.waveManager.gameover();
}
