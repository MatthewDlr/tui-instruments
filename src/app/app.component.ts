import { Component, effect, inject } from "@angular/core";
import { ArduinoService } from "./services/arduino.service";
import { YogaMatComponent } from "./components/yoga-mat/yoga-mat.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [YogaMatComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "tui-instruments";
  
  private readonly arduinoService = inject(ArduinoService);
  public isArduinoConnected = this.arduinoService.isArduinoConnected();
  public isDemoMode = this.arduinoService.isDemoMode();
  public sensorMatrix = this.arduinoService.sensorMatrix();

  constructor() {
    effect(() => {
      this.isArduinoConnected = this.arduinoService.isArduinoConnected();
      this.isDemoMode = this.arduinoService.isDemoMode();
      this.sensorMatrix = this.arduinoService.sensorMatrix();
    });
  }

  public connect() {
    this.arduinoService.connectToArduino();
  }

  public toggleDemoMode() {
    this.arduinoService.toggleDemoMode();
  }
}
