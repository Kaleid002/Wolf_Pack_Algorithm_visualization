import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeSceneComponent } from "./three-scene/three-scene.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThreeSceneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Resume_PJ1';
}
