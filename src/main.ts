import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Color } from "excalibur";
import { loader } from "./resources";
import { model, template } from "./UI/UI";
import { mainScene } from "./scene";
import { worldToPagePixelRatio } from "./lib/pixelAdjustment";
import { play, start, stop, setBPM, bumpProgression, setSeed } from "../src/lib/Chiptune/tracker";
import { changeGain } from "../src/lib/Chiptune/audio";

import { JsfxrResource, SoundConfig } from "@excaliburjs/plugin-jsfxr";
import { sounds } from "./sounds";

export let sndPlugin = new JsfxrResource();
sndPlugin.init(); //initializes the JSFXR library
for (const sound in sounds) {
  sndPlugin.loadSoundConfig(sound, sounds[sound]);
}

const BGMseed = "0x0101086E0E05A5C5F4";

await UI.create(document.body, model, template).attached;

const gameWidth = 500 * 4;
const gameHeight = 300 * 4;

const game = new Engine({
  width: gameWidth, // the width of the canvas
  height: gameHeight, // the height of the canvas
  canvasElementId: "cnv", // the DOM canvas element ID, if you are providing your own
  displayMode: DisplayMode.FitScreenAndFill, // the display mode
  pixelArt: true,
  scenes: { mainScene },
  backgroundColor: Color.fromHex("#2e2e2e"),
});
document.documentElement.style.setProperty("--ex-pixel-ratio", worldToPagePixelRatio(game).toString());

await game.start(loader);
game.goToScene("mainScene");

setSeed(BGMseed);
setBPM(100);
changeGain(0.15);
start();

let toggle = false;

export function toggleMusic() {
  if (!toggle) {
    stop();
    toggle = true;
  } else {
    start();
    toggle = false;
  }
}
