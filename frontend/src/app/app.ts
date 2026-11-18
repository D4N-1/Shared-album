import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  template: '<router-outlet/>',
})
export class App {

  wait = (ms: number): Promise<void> => new Promise( (r) => setTimeout(r, ms) );
  
}
