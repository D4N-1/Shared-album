import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";
import * as fs from "node:fs";


@Injectable()
export class DriveService { 
    private drive;
    private auth;


    constructor(

        private readonly configService: ConfigService,

    ) {


        const keys = JSON.parse( fs.readFileSync( this.configService.getOrThrow<string>('KEY_PATH'), 'utf-8' ) )

        if (keys.type !== 'service_account') throw new Error('Invalid Credentials: expected a service_account key')


        this.auth = new google.auth.JWT({
            email: keys.client_email,
            key: keys.private_key,
            scopes: [ 'https://www.googleapis.com/auth/drive.file' ]
        })

        this.drive = google.drive({ version: 'v3', auth: this.auth })

    }


    async verifyAuth(): Promise<boolean> {

        try {

            await this.auth.authorize();
            return true

        } catch (error) {
            throw new UnauthorizedException('Authentiaction with Google failed')
        }
    }


    /*
    async uploadPhoto(file: Express.Multer.File): Promise<string> {
    try {
      // Convert buffer into a readable stream for Google API
      const mediaStream = new Readable();
      mediaStream.push(file.buffer);
      mediaStream.push(null);

      const folderId = 'YOUR_GOOGLE_DRIVE_FOLDER_ID'; // Replace with your target folder ID

      const response = await this.drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.originalname}`,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: mediaStream,
        },
        fields: 'id, webViewLink, webContentLink',
      });

      // Optional: Make file publicly viewable if needed
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return response.data.webViewLink; // Returns the public view URL
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload photo to Google Drive: ${error.message}`,
      );
    }
  }
    */
}