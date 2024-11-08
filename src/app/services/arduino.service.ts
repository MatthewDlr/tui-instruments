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
  private dataHandler(matrixString: string) {
    const rows = matrixString.split(";");
    const matrix: boolean[][] = rows.map(row => {
      return row.split(",").map(value => value === "1");
    });

    console.log(matrix);
    this.sensorMatrix.set(matrix);

    if (matrix.length > 0) {
      this.soundEngine.generateSoundFromMatrix(matrix);
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
