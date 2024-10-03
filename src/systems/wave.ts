import { BoundingBox, Engine, Scene, Vector, Random } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { playerShip } from "../actors/ship";
import { firstEnemy } from "../actors/firstEnemy";
import { Signal } from "../lib/Signals";
import { UIStore } from "../UI/store";
import { PlayingField } from "../actors/playingField";
import { MainScene } from "../scene";
import { Enemy2 } from "../actors/enemy2";
import { Banner } from "../UI/banner";
import { RentalPool } from "../lib/RentalPool";

export class WaveSystem {
  banner: Banner | undefined = undefined;
  store: UIStore | undefined = undefined;
  startwaveSignal = new Signal("startwave");
  returnToPoolSignal = new Signal("returnEnemyToPool");
  playingField: PlayingField | undefined = undefined;
  state = new ExFSM();
  level = 1;
  engine: Engine | undefined = undefined;

  en2Pool: RentalPool<Enemy2> | undefined;
  en1Pool: RentalPool<firstEnemy> | undefined;
  enemySpawnParams = {
    position: new Vector(0, 0),
    height: 0,
    level: 1,
  };

  constructor(public scene: Scene) {}

  makeE1 = (): firstEnemy => {
    return new firstEnemy(this.enemySpawnParams.position.clone(), this.enemySpawnParams.height, this.enemySpawnParams.level);
  };
  cleanUpE1 = (incoming: firstEnemy): firstEnemy => {
    console.log("cleanUpE1");
    incoming.setNewPosition(this.enemySpawnParams.position, this.enemySpawnParams.level);
    incoming.hp = incoming.maxHP;
    return incoming;
  };
  makeE2 = (): Enemy2 => {
    return new Enemy2(this.enemySpawnParams.position.clone());
  };
  cleanUpE2 = (incoming: Enemy2): Enemy2 => {
    console.log("cleanUpE2");
    incoming.setNewPosition(this.enemySpawnParams.position);
    incoming.hp = incoming.maxhp;
    return incoming;
  };

  initialize(engine: Engine) {
    this.state.register(
      new WaveInit(this.scene, this.state),
      new WaveIdle(this.scene, this.state),
      new WaveActive(this.scene, this.state),
      new WaveCleanup(this.scene, this.state),
      new WaveGameOver(this.scene, this.state),
      new NextWave(this.scene, this.state)
    );
    console.log(this.scene);

    this.enemySpawnParams.height = engine.screen.contentArea.height;
    this.en2Pool = new RentalPool(this.makeE2.bind(this), this.cleanUpE2.bind(this), 1000);
    this.en1Pool = new RentalPool(this.makeE1.bind(this), this.cleanUpE1.bind(this), 1000);
    this.startwaveSignal.listen(this.startWave);
    this.returnToPoolSignal.listen((e: CustomEvent) => {
      console.log("returning enemy to pool", e.detail);

      let returnedEnemy = e.detail.params[0];
      if (!this.en1Pool || !this.en2Pool) return;
      if (returnedEnemy instanceof firstEnemy) {
        this.en1Pool.return(returnedEnemy);
      } else if (returnedEnemy instanceof Enemy2) {
        this.en2Pool.return(returnedEnemy);
      }
    });
  }

  setPlayfield(instance: PlayingField, store?: UIStore, engine?: Engine) {
    this.playingField = instance;
    this.store = store;
    this.engine = engine;
    this.state.set("idle");
  }

  startWave = () => {
    this.state.set("init");
  };

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
  }

  getStorePos() {
    return;
  }
}

class WaveIdle extends ExState {
  firsttime = true;
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("idle", fsm);
  }
  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    const engine = (this.scene as MainScene).waveManager.engine;
    (this.scene as MainScene).showModal(engine);
  }
}

class NextWave extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("nextwave", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    const banner = (this.scene as MainScene).banner as Banner;
    (this.scene as MainScene).waveManager.level++;
    banner.setText("Wave: ", (this.scene as MainScene).waveManager.level);

    console.log("***********************");
    console.log("New Wave");
    console.log("***********************");
    setTimeout(() => this.fsm.set("active"), 2500);
  }

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    const banner = (this.scene as MainScene).banner as Banner;
    banner.hideBanner();
  }
}

class WaveInit extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("init", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    playerShip.reset();
    (this.scene as MainScene).waveManager.playingField!.addShip();
    (this.scene as MainScene).waveManager.level = 1;
    setTimeout(() => this.fsm.set("active"), 2500);
  }
}
class WaveActive extends ExState {
  rng: Random = new Random();
  levelTimer = 60;
  intervalHanlder: any = null;
  moneyInterval: any = null;
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("active", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    this.levelTimer = 60;
    const loops = (this.scene as MainScene).waveManager.level;

    for (let i = 0; i < loops; i++) {
      let nextEnemy: firstEnemy | Enemy2;
      let wave = (this.scene as MainScene).waveManager;

      wave.enemySpawnParams.position = playerShip.pos.clone();
      wave.enemySpawnParams.level = loops;
      console.log("spawning enemy ");
      if (!wave.en1Pool || !wave.en2Pool) return;
      if (this.rng.bool()) nextEnemy = wave.en1Pool.rent(true);
      else nextEnemy = wave.en2Pool.rent(true);
      console.log("next enemy: ", nextEnemy);

      this.scene.add(nextEnemy);
    }

    this.intervalHanlder = setInterval(() => {
      this.levelTimer--;
      (this.scene as MainScene).waveManager.store!.timer!.setTime(this.levelTimer);
      if (this.levelTimer <= 0) {
        clearInterval(this.intervalHanlder);
        this.fsm.set("cleanup");
      }
    }, 1000);

    this.moneyInterval = setInterval(() => {
      (this.scene as MainScene).waveManager.store!.incMoney(1);
    }, 2000);
  }

  exit(_next: ExState | null, ...params: any): void | Promise<void> {
    clearInterval(this.intervalHanlder);
    clearInterval(this.moneyInterval);
  }
  update(...params: any): void | Promise<void> {
    const engine = this.scene.engine;
    const entities = engine.currentScene.entities;
    const filteredEntities = entities.filter(e => e.name === "spawn" || e.name === "enemy");

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
    const banner = (this.scene as MainScene).banner as Banner;
    banner.setText("Wave Complete!!!!");
    banner.showBanner();
    const level = (this.scene as MainScene).waveManager.level;
    (this.scene as MainScene).waveManager.store!.incScore(25);
    (this.scene as MainScene).waveManager.store!.incMoney(100 + level * 25);
    setTimeout(() => {
      this.fsm.set("nextwave");
    }, 2000);
  }
}

class WaveGameOver extends ExState {
  constructor(public scene: Scene, public fsm: ExFSM) {
    super("gameover", fsm);
  }

  enter(_previous: ExState | null, ...params: any): void | Promise<void> {
    const banner = (this.scene as MainScene).banner as Banner;
    banner.setText("Game Over");
    banner.showBanner();
    let gameOverSignal = new Signal("gameover");
    gameOverSignal.send();

    setTimeout(() => {
      banner.hideBanner();
      this.fsm.set("idle");
    }, 2000);
  }
}
