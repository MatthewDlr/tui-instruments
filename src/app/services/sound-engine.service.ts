import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SoundEngineService {
  private birdsAudio = new Audio("/sounds/birds.mp3");
  private candleCracklingAudio = new Audio("/sounds/candle-crackling.mp3");
  private windChimesAudio = new Audio("/sounds/wind-chimes.mp3");
  private yogaAudio = new Audio("/sounds/yoga.mp3");

  public generateSoundFromSensorValues(sensorValues: number[]) {
    const [force1, force2, force3, force4] = sensorValues;

    if (force1 > 256) {
      this.birdsAudio.play();
    } else {
      this.birdsAudio.pause();
    }

    if (force2 > 500) {
      this.candleCracklingAudio.play();
    } else {
      this.candleCracklingAudio.pause();
    }

    if (force3 > 600) {
      this.windChimesAudio.play();
    } else {
      this.windChimesAudio.pause();
    }

    if (force4 > 800) {
      this.yogaAudio.play();
    } else {
      this.yogaAudio.pause();
    }
  }

  public clearAllSounds() {
    this.birdsAudio.pause();
    this.candleCracklingAudio.pause();
    this.windChimesAudio.pause();
    this.yogaAudio.pause();
  }
}
