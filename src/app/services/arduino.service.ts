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
    [false, false, true, false],
    [false, true, false, false],
  ]);
  private sensorValues: number[] = [];

  constructor() {
    this.serial = new NgxSerial(this.dataHandler.bind(this));
  }

  public connectToArduino() {
    this.serial.connect((port: unknown) => {
      this.port.set(port);
      this.isDemoMode.set(false);
    });
  }

  //Date handler for the matrix
  private parseMatrixString(matrixString: string): boolean[][] {
    const rows = matrixString.split(";");
    const matrix: boolean[][] = rows.map(row => {
      return row.split(",").map(value => value === "1");
    });
    this.sensorMatrix.set(matrix);
    console.log(matrix);
    return matrix;
  }

  // Data handler for the force sensors
  private dataHandler(data: string) {
    if (data === undefined || typeof data !== "string") return;
    console.log(data);

    // Remove the trailing "\r" character
    data = data.trim();

    const sensorEntries = data.split(", ");
    sensorEntries.forEach(entry => {
      const sensorData = entry.split(":");

      const sensorId = sensorData[0];
      const sensorValue = parseFloat(sensorData[1]);

      // force sensor values
      if (sensorId.startsWith("f")) {
        const index = parseInt(sensorId.substring(1), 10);
        this.sensorValues[index - 1] = sensorValue;
      }
    });

    this.soundEngine.generateSoundFromSensorValues(this.sensorValues);
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
      const sensorValues = Array.from({ length: 4 }, () => Math.floor(Math.random() * 1024));
      console.log(sensorValues);
      this.soundEngine.generateSoundFromSensorValues(sensorValues);
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
