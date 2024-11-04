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
  public isArduinoConnected: Signal<boolean> = computed(() => this.port !== undefined);
  public isDemoMode: WritableSignal<boolean> = signal(false);

  private sensorValues: number[] = [];

  constructor() {
    this.serial = new NgxSerial(this.dataHandler.bind(this));
  }

  public connectToArduino() {
    this.serial.connect((port: unknown) => {
      this.port.set(port);
    });
  }

  private dataHandler(data: string) {
    if (data === undefined || typeof data !== "string") return;

    const sensorEntries = data.split(", ");
    sensorEntries.forEach(entry => {
      const sensorData = entry.split(": ");
      if (sensorData.length !== 2) return;

      const sensorId = sensorData[0];
      const sensorValue = parseFloat(sensorData[1]);

      // force sensor values
      if (sensorId.startsWith("f")) {
        const index = parseInt(sensorId.substring(1), 10);
        this.sensorValues[index] = sensorValue;
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

  private demoInterval: any;

  private startDemoMode() {
    this.demoInterval = setInterval(() => {
      const sensorValues = Array.from({ length: 4 }, () => Math.floor(Math.random() * 1024));
      this.soundEngine.generateSoundFromSensorValues(sensorValues);
    }, 10);
  }

  private stopDemoMode() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }
}
