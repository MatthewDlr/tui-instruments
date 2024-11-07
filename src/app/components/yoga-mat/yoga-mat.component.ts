import { Component, input } from '@angular/core';

@Component({
  selector: 'app-yoga-mat',
  standalone: true,
  imports: [],
  templateUrl: './yoga-mat.component.html',
  styleUrl: './yoga-mat.component.scss'
})
export class YogaMatComponent {
  matrix = input<boolean[][]>([[]]);

}
