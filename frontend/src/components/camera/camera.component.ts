import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from "@angular/core";
import { PhotoService } from "../../services/photo.service";



@Component({
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnDestroy {

    private photoService = inject(PhotoService);

    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('galleryElement') galleryElement!: ElementRef<HTMLInputElement>;


    private isCameraActive = signal<boolean>(false);
    private isExpanded = signal<boolean>(false);
    private isUploading = signal<boolean>(false);
    private errorMessage = signal<string|null>(null);
    private message = signal<string|null>(null);
    private isFlashing = signal<boolean|null>(null);


    private previewUrl = signal<string|null>(null);
    private pendingFile = signal<{ blob: Blob, name: string }|null>(null);

    private facingMode = signal<'environment' | 'user'>('environment');
    private isSwitchingCamera = signal(false);
    private mediaStream: MediaStream | null = null;

    ngOnDestroy(): void {
        this.stopCamera()
    }
    
    async startCamera(): Promise<void> {
        try {

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: this.facingMode()
                    }
                },
                audio: false
            });

        } catch {

            try {

                this.mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false,
                });

            } catch(error: any) {
                this.errorMessage.set(error.message)
                console.error(error)
            }

        }

        this.isCameraActive.set(true)

        setTimeout( () => {
            if (this.videoElement.nativeElement && this.mediaStream) this.videoElement.nativeElement.srcObject = this.mediaStream
        })

    }

    async toggleCameraFacing(event: Event) {
        event.stopPropagation();
        if (this.isSwitchingCamera()) return;

        this.isSwitchingCamera.set(true);

        const nextMode = this.facingMode() === 'environment' ? 'user' : 'environment';
        this.facingMode.set(nextMode);

        await this.startCamera();

        setTimeout(() => this.isSwitchingCamera.set(false), 450);
    }

    capturePhoto(): void {
        const video = this.videoElement?.nativeElement;
        const canvas = this.canvasElement?.nativeElement;

        if (!video || !canvas) throw new Error('No se pudo acceder al video o al canvas');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

        this.isFlashing.set(true);
        setTimeout(() => this.isFlashing.set(false), 450);

        ctx.save();
        if (this.facingMode() === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const prevUrl = this.previewUrl();
                if (prevUrl) URL.revokeObjectURL(prevUrl);

                const url = URL.createObjectURL(blob);

                this.previewUrl.set(url);
                this.pendingFile.set({
                    name: `cam-${Date.now()}.jpg`,
                    blob
                });
            },
            'image/jpeg',
            0.9
        );
    }

    async onCameraArea(): Promise<void> {

        if ( this.previewUrl() ) return;

        if ( !this.isCameraActive() ) await this.startCamera();

        this.isExpanded.set( !this.isExpanded() )
    }

    async handleCameraAction(event: Event): Promise<void> {
        event.stopPropagation();

        if ( !this.isCameraActive() ) {
          await this.startCamera();
          this.isExpanded.set(true);
          return;
        }

        this.capturePhoto();
    }

    openGallery(): void {
        this.galleryElement.nativeElement.click()
    }

    gallerySelect(event: Event): void {

        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];

        if ( !file ) throw new Error('No se pudo obtener el archivo de galeria');

        const url = URL.createObjectURL(file);
        this.previewUrl.set(url);
        this.pendingFile.set({
            name: file.name,
            blob: file
        })

        this.isExpanded.set(true);

        input.value = '';
    }

    confirmUpload(): void {

        const current = this.pendingFile();
        if ( !current || this.isUploading() ) throw Error('No se puede cargar, no hay archivo o proceso ocupado');

        this.isUploading.set(true);

        this.photoService.uploadPhoto(current.blob, current.name).subscribe({
            next: () => {

                this.isUploading.set(false);
                this.clearPhoto();
                this.showMessage('Foto guardada')
            },
            error: () => {
                this.isUploading.set(false);
                this.errorMessage.set('No se pudo cargar la foto')
            }
        })
    }

    clearPhoto(): void {

        if ( this.previewUrl() ) URL.revokeObjectURL( this.previewUrl()! )

        this.previewUrl.set(null);
        this.pendingFile.set(null);
    }

    discardPhoto(): void {
        this.clearPhoto();
        
        if ( this.mediaStream && this.isCameraActive() ) this.streamVideo();
        else this.startCamera()
    }

    streamVideo(): void {
        setTimeout( () => {
            if ( this.videoElement?.nativeElement && this.mediaStream) this.videoElement.nativeElement.srcObject = this.mediaStream;
        })
    }

    collapseView(event: Event): void {
      event.stopPropagation();
      this.isExpanded.set(false);
    }

    stopCamera(): void {
        this.mediaStream?.getTracks().forEach( (t) => t.stop() );
        this.mediaStream = null;
        this.isCameraActive.set(false);
    }

    showMessage(msg: string): void {
        this.message.set(msg);
        setTimeout( () => this.message.set(null), 3_000);
    }

}