import { Signal } from "../lib/Signals";

const startWaveSignal = new Signal("startwave");

export const model = {};
export const template = `
<div> 
    <canvas id='cnv'> </canvas> 
</div>`;
