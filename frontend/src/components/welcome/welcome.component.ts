import { Component, inject, OnInit, output, signal } from '@angular/core';
import { App } from '../../app/app';

@Component({
  selector: 'app-welcome-splash',
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeSplashComponent implements OnInit {

    private app = inject(App);
    
    private readonly GIF_DURATION_MS = 3200;
    private readonly FADE_DURATION_MS = 4_000;

    finished = output<void>();
    isLeaving = signal(false);
    gifUrl = signal(`/welcome.gif?t=${Date.now()}`);

    async ngOnInit(): Promise<void> {
        await this.app.wait(this.GIF_DURATION_MS);

        this.isLeaving.set(true);

        await this.app.wait(this.FADE_DURATION_MS);
        this.finished.emit();
    }

}