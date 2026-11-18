import { Component, inject, OnInit, output, signal } from '@angular/core';
import { App } from '../../app/app';

@Component({
  selector: 'app-welcome-splash',
  template: `
    <div class="splash-screen" [class.is-leaving]="isLeaving()">
      <div class="splash-content">
        <!-- Tip: agregar ?t= fuerza a que el GIF siempre inicie desde el fotograma 1 -->
        <img [src]="gifUrl()" alt="Bienvenida" class="splash-gif" />
        <h2 class="splash-title">¡Bienvenido al Álbum Compartido!</h2>
        <p class="splash-subtitle">Prepara tu mejor sonrisa para capturar el momento</p>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: fixed;
      inset: 0;
      z-index: 200;
      background-color: var(--bg-color);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .splash-screen.is-leaving {
      opacity: 0;
      transform: scale(1.03);
      pointer-events: none;
    }

    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      max-width: 340px;
      animation: contentEnter 0.5s ease-out forwards;
    }

    .splash-gif {
      width: 180px;
      height: 180px;
      object-fit: contain;
    }

    .splash-title {
      margin: 0;
      font-family: var(--main-font);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--cr-color);
    }

    .splash-subtitle {
      margin: 0;
      font-family: var(--main-font);
      font-size: 1.2rem;
      color: var(--txt-color);
      line-height: 1.4;
    }

    @keyframes contentEnter {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
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