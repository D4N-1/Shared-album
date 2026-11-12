import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { DriveModule } from './modules/drive/drive.module.js';
import { PhotoModule } from './modules/photo/photo.module.js';

@Module({
  imports: [

    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true
    }),

    ScheduleModule.forRoot(),

    DatabaseModule,

    DriveModule,
    PhotoModule

  ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule {}
