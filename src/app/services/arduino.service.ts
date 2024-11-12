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

  public sensorMatrix: WritableSignal<boolean[][]> = signal([
    [false, false, false, false],
    [false, false, false, false],
  ]);
  public forceSensorMap = new Map<string, number>();

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
    const matrix: boolean[][] = [];

    if (matrixString.includes("A")) {
      // Handle the case where we receive the force sensor values
      const pairs = matrixString.split(",");
      pairs.forEach(pair => {
        const [key, value] = pair.split(":").map(item => item.trim());
        const index = parseInt(key.substring(1), 10);
        this.forceSensorMap.set(key, parseInt(value, 10));

        if (index % 2 === 0) {
          matrix[0][index / 2] = parseInt(value, 10) > 0;
        } else {
          matrix[1][Math.floor(index / 2)] = parseInt(value, 10) > 0;
        }
      });

      console.log(this.forceSensorMap);
    } else {
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
