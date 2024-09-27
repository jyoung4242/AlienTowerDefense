import { Signal } from "../lib/Signals";

const startWaveSignal = new Signal("startwave");

export const model = {
  canvasWidth: 0,
  canvasHeight: 0,
  score: 0,
  money: 100,
  waveNumber: 1,
  waveTimer: 60,
  showHud: false,
  showWaveBanner: false,
  showWaveCompleteBanner: false,
  waveCompleteBannerText: "Wave Complete!!!",
  showPreWaveModal: false,
  preWaveButtonHandler: () => {
    model.showPreWaveModal = false;
    model.showHud = true;
    startWaveSignal.send();
  },
};
export const template = `
<style> 
    
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
    
    <preWave-modal \${===showPreWaveModal}>
            <p>Insert initial modal text here.Insert initial modal text here.Insert initial modal text here.Insert initial modal text here.Insert initial modal text here.Insert initial modal text here.
            </p>
            <button \${click@=>preWaveButtonHandler}>Start Game</button>
    </preWave-modal>
    <wave-banner \${===showWaveBanner}>Wave \${waveNumber}</wave-banner>
    <wavecomplete-banner \${===showWaveCompleteBanner}>\${waveCompleteBannerText}</wavecomplete-banner>
</div>`;

export function setUIDims(width: number, height: number): void {
  model.canvasWidth = width;
  model.canvasHeight = height;
}

export function getScore(): number {
  return model.score;
}

export function showHud() {
  //model.showHud = true;
}

export function hideHud() {
  //model.showHud = false;
}

export function showPreWaveModal() {
  //model.showPreWaveModal = true;
}

export function hidePreWaveModal() {
  //model.showPreWaveModal = false;
}

export function getMoney(): number {
  return model.money;
}

export function incMoney(delta: number): void {}

export function decMoney(delta: number): void {}

export function showWaveBanner() {
  model.showWaveBanner = true;
}

export function hideWaveBanner() {
  model.showWaveBanner = false;
}

export function showWaveCompleteBanner() {
  model.showWaveCompleteBanner = true;
}

export function hideWaveCompleteBanner() {
  model.showWaveCompleteBanner = false;
}

export function incWaveNum() {
  model.waveNumber++;
}

export function setBannerText(text: string) {
  model.waveCompleteBannerText = text;
}

export function resetUI() {
  model.score = 0;
  model.money = 100;
  model.waveNumber = 1;

  model.waveCompleteBannerText = "Wave Complete!!!";
}

export function setWaveTimer(time: number) {}
