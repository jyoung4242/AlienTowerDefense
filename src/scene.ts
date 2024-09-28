import { Camera, Engine, Scene, SceneActivationContext, Vector } from "excalibur";
import { WaveSystem } from "./systems/wave";
import { TurretTower } from "./actors/turretTower";
import { decMoney, getMoney } from "./UI/UI";
import { Signal } from "./lib/Signals";
import { PlayingField } from "./actors/playingField";
import { UIStore } from "./UI/store";
import { StartingModal } from "./UI/startingModal";
import { toggleMusic } from "./main";

export class MainScene extends Scene {
  store: UIStore | undefined;
  modal: StartingModal | undefined;
  waveManager: WaveSystem;
  cameraShakeSignal = new Signal("cameraShake");
  startwaveSignal = new Signal("startwave");

  constructor() {
    super();
    this.waveManager = new WaveSystem(this);
    this.waveManager.initialize();
  }

  getState() {
    return this.waveManager.state.get();
  }

  onInitialize(engine: Engine): void {
    let screenDims = engine.screen.contentArea;
    this.cameraShakeSignal.listen(() => {
      this.camera.shake(5, 5, 0.75);
    });

    this.startwaveSignal.listen(() => {
      this.closeModal();
    });

    //debug pause
    this.input.keyboard.on("press", e => {
      if (e.key === "Space") {
        const testclock = engine.debug.useTestClock();
        testclock.stop();
      } else if (e.key == "Enter") {
        toggleMusic();
      }
    });

    let screenArea = engine.screen.contentArea;
    let uiScreenDims = new Vector(screenArea.width * 0.15, screenArea.height);
    this.store = new UIStore(uiScreenDims, new Vector(0, 0));
    let playingField = new PlayingField(engine, this.store);
    this.add(playingField);
    this.waveManager.setPlayfield(playingField, this.store, engine);
    this.add(this.store);
    this.waveManager.reset();
  }

  onPreUpdate(engine: Engine, delta: number): void {
    this.waveManager.update(engine);
  }

  addTower(e: any) {
    if (!this.store) return;
    this.add(new TurretTower(e.worldPos, this.store));
  }

  showModal = (engine?: Engine) => {
    if (!engine) this.modal = new StartingModal(this.engine);
    else this.modal = new StartingModal(engine);
    this.add(this.modal);
  };

  closeModal = () => {
    if (!this.modal) return;

    this.remove(this.modal);
    this.modal = undefined;
  };

  gameover() {
    this.waveManager.gameover();
  }

  startwave() {
    this.waveManager.startWave();
  }
}

export const mainScene = new MainScene();

export const gameover = () => {
  console.trace("game over");
  mainScene.gameover();
};
