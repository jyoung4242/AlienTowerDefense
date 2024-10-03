import { Actor, Circle, Color, Engine, Graphic, GraphicsGroup, Vector } from "excalibur";
import { ExFSM, ExState } from "../lib/ExFSM";
import { turretIdleAnimation } from "../animations/turrentAnimation";
import { turretIdleLeft } from "../animations/sniperAnimation";
import { Signal } from "../lib/Signals";

const previewFieldShape = new Circle({
  radius: 100,
  color: Color.fromRGB(255, 255, 255, 1.0),
});

export class TurretPreview extends Actor {
  changeTurretSignal = new Signal("changeTurret");
  fsm = new ExFSM();
  graphicsGroup: GraphicsGroup;
  constructor() {
    super({});

    this.graphicsGroup = new GraphicsGroup({
      members: [
        {
          graphic: previewFieldShape,
          offset: new Vector(0, 0),
        },
        {
          graphic: turretIdleAnimation.frames[0].graphic as Graphic,
          offset: new Vector(94, 94),
        },
      ],
    });
    this.scale = new Vector(2, 2);
    this.graphics.add(this.graphicsGroup);
    this.graphics.opacity = 0.25;
    this.fsm.register("turret", "sniper");
    this.fsm.set("turret");
  }

  onInitialize(engine: Engine): void {
    // Add a mouse move listener
    engine.input.pointers.primary.on("move", evt => {
      this.pos.x = evt.worldPos.x;
      this.pos.y = evt.worldPos.y;
    });

    this.changeTurretSignal.listen((params: any) => {
      //console.log("changeTurretSignal", params);
      if (params.detail.params[0] == 1) this.fsm.set("sniper");
      else this.fsm.set("turret");
    });
  }

  onPreUpdate(engine: Engine, delta: number): void {
    const currentstate = this.fsm.get();
    //console.log("currentstate", currentstate);

    //@ts-ignore
    if ((currentstate as ExState).name == "sniper") {
      //console.log("here");

      //@ts-ignore
      this.graphicsGroup.members[0].graphic.radius = 250;
      //@ts-ignore
      this.graphicsGroup.members[1].graphic = turretIdleLeft.frames[0].graphic as Graphic;
      //@ts-ignore
      this.graphicsGroup.members[1].offset = new Vector(244, 244);
    } else {
      //@ts-ignore
      this.graphicsGroup.members[0].graphic.radius = 100;
      //@ts-ignore
      this.graphicsGroup.members[1].graphic = turretIdleAnimation.frames[0].graphic as Graphic;
      //@ts-ignore
      this.graphicsGroup.members[1].offset = new Vector(94, 94);
    }
  }
}
