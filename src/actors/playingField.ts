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

export class PlayingField extends Actor {
  store: UIStore;
  startwaveSignal = new Signal("startwave");

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

  onInitialize(engine: Engine): void {
    this.on("pointerup", e => {
      if ((engine.currentScene as MainScene).getState().name == "idle") return;
      // get turret selected in UI store
      let getCurrentTurret = this.store.getCurrentTurret();
      let currentTurretCost = getCurrentTurret.cost;
      let currentMoney = this.store.getMoney();

      if (currentMoney || currentMoney! >= currentTurretCost) {
        this.store.decMoney(currentTurretCost);
        switch (getCurrentTurret.name) {
          case "turret":
            this.addChild(new TurretTower(new Vector(e.screenPos.x - this.store.width / 2, e.screenPos.y), this.store));
            break;
          case "sniper":
            this.addChild(new SniperTurret(new Vector(e.screenPos.x - this.store.width / 2, e.screenPos.y), this.store));
            break;
        }
      }
      sndPlugin.playSound("placeTurret");
    });
  }

  addShip() {
    const shipPos = new Vector(this.width / 2, this.height / 2);
    playerShip.setPos(shipPos);
    this.addChild(playerShip);
  }

  onPreUpdate(engine: Engine, delta: number): void {}
}
