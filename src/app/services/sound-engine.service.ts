import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SoundEngineService {
  private kickLoop = new Audio("/sounds/KickLoop.mp3");

  public generateSoundFromMatrix(matrix: boolean[][]): void {
    const matrixSize = this.getMatrixSize(matrix);
    const numberOfActiveSensors = this.getNumberOfActiveSensors(matrix);

    // Play the kick loop if at least one sensor is active
    if (numberOfActiveSensors > 0 ) {
      this.kickLoop.play();
    } else {
      this.kickLoop.pause();
      this.kickLoop.currentTime = 0;
    }

    // If at least 3 sensors are active, play the a random drum between 1 and 6
    if (numberOfActiveSensors >= 3) {
      const randomDrum = Math.floor(Math.random() * 6) + 1;
      this.playAudio("Drum" + randomDrum);
    }

    // If all sensors are active, play the drum roll
    if (matrixSize === numberOfActiveSensors) {
      this.playAudio("DrumRoll");
    }

    // If at least a sensor from the first row is active, play a random cymbal between 1 and 4
    if (matrix[0].some(sensor => sensor)) {
      const randomCymbal = Math.floor(Math.random() * 4) + 1;
      this.playAudio("Cymbal" + randomCymbal);
    }

    // If at least one sensor from each row is active, play a random kick between 1 and 4
    if (matrix.every(row => row.some(sensor => sensor))) {
      const randomKick = Math.floor(Math.random() * 4) + 1;
      this.playAudio("Kick" + randomKick);
    }

    // if a sensor has no sensor neighbors enabled, play the slamming door sound
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] && !this.hasNeighbor(matrix, i, j)) {
          this.playAudio("SlammingDoor");
        }
      }
    }

  }

  public clearAllSounds() {
    this.kickLoop.pause();
    this.kickLoop.currentTime = 0;
  }

  private playAudio(path: string) {
    const audio = new Audio(`/sounds/${path}.mp3`);
    audio.play();
  }

  private hasNeighbor(matrix: boolean[][], row: number, col: number): boolean {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // up, down, left, right
      [-1, -1], [-1, 1], [1, -1], [1, 1] // diagonals
    ];

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      if (newRow >= 0 && newRow < matrix.length && newCol >= 0 && newCol < matrix[0].length) {
        if (matrix[newRow][newCol]) {
          return true;
        }
      }
    }

    return false;
  }

  private getMatrixSize(matrix: boolean[][]): number {
    let count = 0;
    for (const row of matrix) {
      count += row.length;
    }
    return count;
  }

  private getNumberOfActiveSensors(matrix: boolean[][]): number {
    return matrix.reduce((acc, row) => {
      return acc + row.reduce((acc, value) => {
        return value ? acc + 1 : acc;
      }, 0);
    }, 0);
  }
}
