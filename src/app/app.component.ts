import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ArduinoService } from "./services/arduino.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  title = "tui-instruments";
  private arduinoService = inject(ArduinoService);

  public connect() {
    this.arduinoService.connectToArduino();
  }
}
