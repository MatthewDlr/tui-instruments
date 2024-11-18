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
  public inputMode: WritableSignal<"capacitive" | "force" | "both"> = signal("capacitive");

  public sensorMatrix: WritableSignal<boolean[][]> = signal([
    [false, false, false],
    [false, false, false],
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

    if ((this.inputMode() == "capacitive" || this.inputMode() == "both") && matrixString.startsWith("CS")) {
      const sensorsString = matrixString.split(", ")
      for (const sensorString of sensorsString) {
        const sensor = sensorString.split(":")[0];
        const value = Number(sensorString.split(":")[1]);

        if (sensor == "CS1") {
          this.sensorMatrix.update(matrix => {
            matrix[0][2] = value === 1;
            return matrix;
          });
        } else if (sensor == "CS2") {
          this.sensorMatrix.update(matrix => {
            matrix[0][1] = value === 1;
            return matrix;
          });
        } else if (sensor == "CS3") {
          this.sensorMatrix.update(matrix => {
            matrix[0][0] = value === 1;
            return matrix;
          });
        } else if (sensor == "CS4") {
          this.sensorMatrix.update(matrix => {
            matrix[1][2] = value === 1;
            return matrix;
          });
        } else if (sensor == "CS5") {
          this.sensorMatrix.update(matrix => {
            matrix[1][1] = value === 1;
            return matrix;
          });
        } else if (sensor == "CS6") {
          this.sensorMatrix.update(matrix => {
            matrix[1][0] = value === 1;
            return matrix;
          });
        }
      }

      this.soundEngine.generateSoundFromMatrix(this.sensorMatrix());
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
