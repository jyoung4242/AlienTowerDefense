import "./style.css";
import { UI } from "@peasy-lib/peasy-ui";
import { Engine, DisplayMode, Color } from "excalibur";
import { loader } from "./resources";
import { model, template, setUIDims } from "./UI/UI";
import { mainScene } from "./scene";
import { worldToPagePixelRatio } from "./lib/pixelAdjustment";

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

setUIDims(game.screen.canvasWidth, game.screen.canvasHeight);

await game.start(loader);
game.goToScene("mainScene");
