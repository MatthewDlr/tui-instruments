import { computed, inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { NgxSerial } from "ngx-serial";
import { SoundEngineService } from "./sound-engine.service";

@Injectable({
  providedIn: "root",
})
export class ArduinoService {
  private readonly soundEngine = inject(SoundEngineService);
  private serial: NgxSerial;
  private port: WritableSignal<unknown> = signal(undefined);
  public isArduinoConnected: Signal<boolean> = computed(() => this.port() !== undefined);
  public isDemoMode: WritableSignal<boolean> = signal(false);
  public inputMode: WritableSignal<"capacitive" | "force" | "both"> = signal("force");

  public sensorMatrix: WritableSignal<boolean[][]> = signal([
    [false, false, false, false],
    [false, false, false, false],
  ]);

  constructor() {
    this.serial = new NgxSerial(this.dataHandler.bind(this));
  }

  public connectToArduino() {
    this.serial.connect((port: unknown) => {
      this.port.set(port);
      this.isDemoMode.set(false);
    });
  }

  private dataHandler(matrixString: string) {
    console.log(matrixString);
    const matrix: boolean[][] = [[]];

    if ((this.inputMode() === "force" || this.inputMode() === "both") && matrixString.includes("A")) {
      if (matrixString.endsWith(",")) matrixString = matrixString.slice(0, -1);
      const forceSensorMap = new Map<string, number>();
      const pairs = matrixString.split(",");

      pairs.forEach(pair => {
        if (pair) {
          const [key, value] = pair.split(":");
          const numericValue = Number(value);
          const portNumber = Number(key[1]);
          if (!isNaN(numericValue) && !isNaN(portNumber)) {
            forceSensorMap.set(key, numericValue);
          }
        }
      });
      const forceMatrix: boolean[][] = [[], []];
      forceSensorMap.forEach((value, key) => {
        const keyNumber = Number(key[1]);
        if (keyNumber === 0 || keyNumber % 2 === 0) {
          forceMatrix[0].push(value > 0);
        } else {
          forceMatrix[1].push(value > 0);
        }
      });
      console.log(forceMatrix);
      this.sensorMatrix.set(forceMatrix);

      if (this.inputMode() === "both") {
        this.sensorMatrix.set([...this.sensorMatrix(), ...forceMatrix]);
      } else {
        this.sensorMatrix.set(forceMatrix);
      }
      if (matrix.length > 0) {
        this.soundEngine.generateSoundFromMatrix(forceMatrix);
      }
    } else if (this.inputMode() === "capacitive" || this.inputMode() === "both") {
      // Handle the case where we receive the capacitive sensor matrix
      const rows = matrixString.split(";");
      rows.forEach(row => {
        const rowArray = row.split(",").map(value => value === "1");
        matrix.push(rowArray);
      });

      console.log(matrix);
      this.sensorMatrix.set(matrix);
      if (matrix.length > 0) {
        this.soundEngine.generateSoundFromMatrix(matrix);
      }
    }
  }

  toggleDemoMode() {
    this.isDemoMode.set(!this.isDemoMode());
    console.log(this.isDemoMode());

    if (this.isDemoMode()) {
      this.startDemoMode();
    } else {
      this.stopDemoMode();
    }
  }

  private demoInterval: NodeJS.Timeout | null = null;

  private startDemoMode() {
    this.demoInterval = setInterval(() => {
      const matrix = this.sensorMatrix();
      const newMatrix = matrix.map(row => row.map(() => Math.random() > 0.5));
      this.sensorMatrix.set(newMatrix);
      this.soundEngine.generateSoundFromMatrix(newMatrix);
    }, 1000);
  }

  private stopDemoMode() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
      this.soundEngine.clearAllSounds();
    }
  }
}
