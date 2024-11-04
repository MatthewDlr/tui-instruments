import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SoundEngineService {
  private sounds = ["achievement", "coin", "game1", "storm", "wind", "wood"];

  public generateSoundFromSensorValues(sensorValues: number[]) {
    const maxSensorValue = Math.max(...sensorValues);

    // Map sensor values to sounds
    const soundSequence = sensorValues.map(value => {
      const soundIndex = Math.floor((value / maxSensorValue) * (this.sounds.length - 1));
      return this.sounds[soundIndex];
    });

    // Play the sounds in sequence
    soundSequence.forEach((sound, index) => {
      setTimeout(() => {
        this.playSound(sound);
      }, index * 1000); // Play each sound 1 second apart
    });
  }

  private playSound(soundName: string, duration?: number) {
    const audio = new Audio(`sounds/${soundName}.mp3`);
    audio
      .play()
      .then(() => {
        console.log(`Playing sound: ${soundName}`);
        if (duration && duration > 0) {
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log(`Stopped sound: ${soundName} after ${duration}ms`);
          }, duration);
        }
      })
      .catch(error => {
        console.error(`Error playing sound: ${soundName}`, error);
      });
  }
}
