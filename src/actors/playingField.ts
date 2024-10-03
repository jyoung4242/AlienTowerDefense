import { Actor, Color, Engine, TileMap, Vector } from "excalibur";
import { WaveSystem } from "../systems/wave";
import { TurretTower } from "./turretTower";
import { MainScene } from "../scene";
import { Signal } from "../lib/Signals";
import { UIStore } from "../UI/store";
import { Resources } from "../resources";
import { SniperTurret } from "./sniperTurret";
import { playerShip } from "./ship";
import { sndPlugin } from "../main";
import { RentalPool } from "../lib/RentalPool";

export class PlayingField extends Actor {
  turretPool: RentalPool<TurretTower>;
  sniperPool: RentalPool<SniperTurret>;
  store: UIStore;
  returnToPoolSignal = new Signal("returnToPool");
  startwaveSignal = new Signal("startwave");
  newTurretParams = {
    type: "turret" as "turret" | "sniper",
    position: new Vector(0, 0),
  };

  constructor(public engine: ex.Engine, store: UIStore) {
    let screenArea = engine.screen.contentArea;
    const sX = 0.85 * screenArea.width;
    const sY = screenArea.height;

    let pX = 0;
    let pY = 0;

    super({
      name: "playingField",
      x: pX,
      y: pY,
      width: sX,
      height: sY,
      anchor: Vector.Zero,
      color: Color.fromHex("#2e2e2e"),
    });
    this.store = store;
    this.turretPool = new RentalPool(this.addTurret.bind(this), this.cleanTurret.bind(this), 750);
    this.sniperPool = new RentalPool(this.addSniperTurret.bind(this), this.cleanSniperTurret.bind(this), 750);
    this.engine.currentScene.camera.strategy.lockToActor(this);

    const tileswide = Math.ceil(screenArea.width / 256);
    const tileshigh = Math.ceil(screenArea.height / 256);

    const tmap = new TileMap({
      tileWidth: 256,
      tileHeight: 256,
      columns: tileswide,
      rows: tileshigh,
      name: "tmap",
    });
    for (const tile of tmap.tiles) {
      tile.addGraphic(Resources.background.toSprite());
    }

    this.addChild(tmap);
  }

  addSniperTurret(): SniperTurret {
    return new SniperTurret(this.newTurretParams.position.clone(), this.store);
  }

  addTurret = (): TurretTower => {
    //new Vector(e.screenPos.x - this.store.width / 2, e.screenPos.y
    if (this.newTurretParams.type == "turret") return new TurretTower(this.newTurretParams.position.clone(), this.store);
    return new SniperTurret(this.newTurretParams.position.clone(), this.store);
  };

  cleanTurret(incoming: TurretTower): TurretTower {
    incoming.pos = this.newTurretParams.position.clone();
    incoming.hp = incoming.maxhp;
    return incoming;
  }

  cleanSniperTurret(incoming: SniperTurret): SniperTurret {
    incoming.pos = this.newTurretParams.position.clone();
    incoming.hp = incoming.maxhp;
    return incoming;
  }

  onInitialize(engine: Engine): void {
    this.returnToPoolSignal.listen((e: CustomEvent) => {
      let turret = e.detail;
      if (turret instanceof TurretTower) this.turretPool.return(turret);
      else if (turret instanceof SniperTurret) this.sniperPool.return(turret);
    });

    this.on("pointerup", e => {
      if ((engine.currentScene as MainScene).getState().name == "idle") return;
      // get turret selected in UI store
      let getCurrentTurret = this.store.getCurrentTurret();
      let currentTurretCost = getCurrentTurret.cost;
      let currentMoney = this.store.getMoney();
      let nextTurret;

      if (currentMoney && currentMoney! >= currentTurretCost) {
        this.store.decMoney(currentTurretCost);
        this.newTurretParams.type = getCurrentTurret.name;
        this.newTurretParams.position = new Vector(e.screenPos.x - this.store.width / 2, e.screenPos.y);

        if (this.newTurretParams.type == "turret") nextTurret = this.turretPool.rent(true);
        else nextTurret = this.sniperPool.rent(true);
        this.addChild(nextTurret);
        sndPlugin.playSound("placeTurret");
      }
    });
  }

  addShip() {
    const shipPos = new Vector(this.width / 2, this.height / 2);
    playerShip.setPos(shipPos);
    this.addChild(playerShip);
  }

  onPreUpdate(engine: Engine, delta: number): void {}
}
