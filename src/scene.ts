import { Camera, Engine, Scene, SceneActivationContext, Vector } from "excalibur";
import { WaveSystem } from "./systems/wave";
import { TurretTower } from "./actors/turretTower";
import { decMoney, getMoney } from "./UI/UI";
import { Signal } from "./lib/Signals";
import { PlayingField } from "./actors/playingField";
import { UIStore } from "./UI/store";

export class MainScene extends Scene {
  store: UIStore | undefined;
  waveManager: WaveSystem;
  cameraShakeSignal = new Signal("cameraShake");
  constructor() {
    super();
    console.log("main scene");
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

    let screenArea = engine.screen.contentArea;
    let uiScreenDims = new Vector(screenArea.width * 0.15, screenArea.height);
    this.store = new UIStore(uiScreenDims, new Vector(0, 0));
    let playingField = new PlayingField(engine, this.store);
    this.add(playingField);
    this.waveManager.setPlayfield(playingField, this.store);
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
