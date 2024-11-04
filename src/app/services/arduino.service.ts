import { computed, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { NgxSerial } from "ngx-serial";

@Injectable({
  providedIn: "root",
})
export class ArduinoService {
  private serial: NgxSerial;
  private port: WritableSignal<unknown> = signal(undefined);
  public isArduinoConnected: Signal<boolean> = computed(() => this.port !== undefined);

  constructor() {
    this.serial = new NgxSerial(this.dataHandler.bind(this));
  }

  public connectToArduino() {
    this.serial.connect((port: unknown) => {
      this.port.set(port);
    })
  }

  private dataHandler(data: string) {
    if (data === undefined || typeof data !== "string") return;
  }
}
