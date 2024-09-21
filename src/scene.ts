import { Engine, Scene } from "excalibur";
import { WaveSystem } from "./systems/wave";
import { TurretTower } from "./actors/turretTower";
import { playerShip } from "./actors/ship";
import { firstEnemy } from "./actors/firstEnemy";
import { decMoney, getMoney } from "./UI/UI";

class MainScene extends Scene {
  waveManager: WaveSystem;
  constructor() {
    super();
    this.waveManager = new WaveSystem(this);
    this.waveManager.initialize();
  }

  onInitialize(engine: Engine): void {
    this.waveManager.reset();

    this.input.pointers.on("down", e => {
      if (this.waveManager.state.get().name == "idle") return;

      if (getMoney() >= 25) {
        decMoney(25);
        this.add(new TurretTower(e.worldPos));
      }
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
