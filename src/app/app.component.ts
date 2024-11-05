import { Component, effect, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ArduinoService } from "./services/arduino.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "tui-instruments";
  private readonly arduinoService = inject(ArduinoService);
  public isArduinoConnected = this.arduinoService.isArduinoConnected();
  public isDemoMode = this.arduinoService.isDemoMode();

  constructor() {
    effect(() => {
      this.isArduinoConnected = this.arduinoService.isArduinoConnected();
      this.isDemoMode = this.arduinoService.isDemoMode();
    });
  }

  public connect() {
    this.arduinoService.connectToArduino();
  }

  public toggleDemoMode() {
    this.arduinoService.toggleDemoMode();
  }
}
