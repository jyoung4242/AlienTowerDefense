import { Engine, Scene } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { playerShip } from "../actors/ship";
import { firstEnemy } from "../actors/firstEnemy";
import { Signal } from "../lib/Signals";
import {
  hideWaveBanner,
  hideWaveCompleteBanner,
  incMoney,
  incWaveNum,
  resetUI,
  setBannerText,
  setWaveTimer,
  showHud,
  showPreWaveModal,
  showWaveBanner,
  showWaveCompleteBanner,
} from "../UI/UI";

export class WaveSystem {
  state = new ExFSM();
  level = 1;

  constructor(public scene: Scene) {}
  initialize() {
    this.state.register(
      new WaveInit(this.scene, this.state),
      new WaveIdle(this.scene, this.state),
      new WaveActive(this.scene, this.state),
      new WaveCleanup(this.scene, this.state),
      new WaveGameOver(this.scene, this.state),
      new NextWave(this.scene, this.state)
    );
    this.state.set("idle");
  }
  startWave() {
    this.state.set("init");
  }

  update(engine: Engine) {
    this.state.update();
  }

  endWave() {
    this.state.set("cleanup");
  }

  gameover() {
    this.state.set("gameover");
  }

  reset() {
    this.level = 1;
    this.state.set("idle");
    showPreWaveModal();
  }
}

class WaveIdle extends ExState {
  firsttime = true;
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("idle", fsm);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    if (this.firsttime) {
      this.firsttime = false;
      return;
    } else showPreWaveModal();
  }
}

class NextWave extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("nextwave", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    showHud();
    showWaveBanner();
    setTimeout(() => this.fsm.set("active"), 2500);
  }

  update(...params: any): void | Promise<void> {}
}

class WaveInit extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("init", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    playerShip.reset();
    resetUI();
    this.scene.add(playerShip);

    showHud();
    showWaveBanner();
    setTimeout(() => this.fsm.set("active"), 2500);
  }
}
class WaveActive extends ExState {
  levelTimer = 60;
  intervalHanlder: any = null;
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("active", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    hideWaveBanner();
    this.scene.add(new firstEnemy());
    this.intervalHanlder = setInterval(() => {
      this.levelTimer--;
      setWaveTimer(this.levelTimer);
      if (this.levelTimer <= 0) {
        clearInterval(this.intervalHanlder);
        this.fsm.set("gameover");
      }
    }, 1000);
  }

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    clearInterval(this.intervalHanlder);
  }
  update(...params: any): void | Promise<void> {
    const engine = this.scene.engine;
    const entities = engine.currentScene.entities;
    // filter out ship, turret, blasts
    const filteredEntities = entities.filter(e => e.name === "spawn" || e.name === "enemy");
    // all that's left is enemies

    if (filteredEntities.length <= 0) {
      this.fsm.set("cleanup");
    }
  }
}
class WaveCleanup extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("cleanup", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    setBannerText("Wave Complete!!!!");
    showWaveCompleteBanner();
    incWaveNum();
    incMoney(100);
    setTimeout(() => {
      hideWaveCompleteBanner();
      this.fsm.set("nextwave");
    }, 2000);
  }
}

class WaveGameOver extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("gameover", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    setBannerText("Game Over");
    let gameOverSignal = new Signal("gameover");
    gameOverSignal.send();
    showWaveCompleteBanner();
    setTimeout(() => {
      hideWaveCompleteBanner();
      setBannerText("Wave Complete!!!!");
      this.fsm.set("idle");
    }, 2000);
  }
}
