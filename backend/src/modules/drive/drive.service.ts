import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { google } from "googleapis";
import * as fs from "node:fs";
import * as fsAsync from "node:fs/promises";
import path, { join } from "node:path";
import { Readable } from "node:stream";
import { PhotoEntity, PhotoStatus } from "../photo/entities/photo.entity.js";
import { PhotoService } from "../photo/photo.service.js";


@Injectable()
export class DriveService { 
    private readonly logger = new Logger(DriveService.name);
    private drive;
    private auth;
    
    private isSyncing = false;

    private uploadsDir = path.resolve( process.cwd(), 'uploads' )

    private driveId: string;


    constructor(

        private readonly configService: ConfigService,
        private readonly photoService: PhotoService

    ) {


        const keys = JSON.parse( fs.readFileSync( this.configService.getOrThrow<string>('KEY_PATH'), 'utf-8' ) )

        if (keys.type !== 'service_account') throw new Error('Invalid Credentials: expected a service_account key')


        this.auth = new google.auth.OAuth2(
          configService.getOrThrow<string>('CLIENT_ID'),
          configService.getOrThrow<string>('CLIENT_SECRET'),
          'https://developers.google.com/oauthplayground'
        )

        this.auth.setCredentials({
          refresh_token: configService.getOrThrow<string>('REFRESH_TOKEN')
        })

        this.drive = google.drive({ version: 'v3', auth: this.auth })


        this.logger.debug(this.uploadsDir)

        this.driveId = this.configService.getOrThrow<string>('DRIVE_FOLDER')

    }
    

    async verifyAuth(): Promise<boolean> {
        try {

            const { token } = await this.auth.getAccessToken()
            if (!token) throw new Error('No se pudo tener accesso token')
            return true

        } catch (error) {
            throw new UnauthorizedException('Authentiaction with Google failed')
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async syncDrive() {

      if (this.isSyncing) return

      this.isSyncing = true



      const photosPending = await this.photoService.findAllPending({ limit: 10 })

      console.log(photosPending)

      for (const photo of photosPending.data) {

        await this.uploadPhoto(photo)
      }

      this.isSyncing = false

    }


    async uploadPhoto(photo: PhotoEntity): Promise<string> {
      const filePath = join(this.uploadsDir, photo.name)

      try {

        const fileBuffer = await fsAsync.readFile(filePath);

        const bufferStream = Readable.from(fileBuffer);

        const res = await this.drive.files.create({
          requestBody: {
            name: photo.name,
            parents: [this.driveId],
          },
          media: {
            mimeType: photo?.mimeType || 'image/jpeg',
            body: bufferStream,
          },
          fields: 'id, webViewLink, webContentLink',
        });

        const fileId = res.data.id;

        if (!fileId) throw new Error('No se pudo obtener el ID del archivo subido en Google Drive');

        this.drive.permissions.create({
          fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        photo.status = PhotoStatus.SYNCED
        await this.photoService.updatePhoto(photo)

        return res.data.webViewLink ?? 'empty';


      } catch (error:any) {

        photo.status = PhotoStatus.FAILED
        await this.photoService.updatePhoto(photo)
        
        throw new InternalServerErrorException(
          `Failed to upload photo to Google Drive: ${error.message}`,
        );
      }

    }
}