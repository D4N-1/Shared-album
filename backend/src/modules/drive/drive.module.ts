import { Module } from "@nestjs/common";
import { PhotoModule } from "../photo/photo.module.js";
import { DriveController } from "./drive.controller.js";
import { DriveService } from "./drive.service.js";



@Module({
    imports: [
        PhotoModule
    ],
    controllers: [ DriveController ],
    providers: [ DriveService ]
})
export class DriveModule { }