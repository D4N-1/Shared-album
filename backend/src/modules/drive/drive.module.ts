import { Module } from "@nestjs/common";
import { DriveController } from "./drive.controller.js";
import { DriveService } from "./drive.service.js";



@Module({
    controllers: [ DriveController ],
    providers: [ DriveService ]
})
export class DriveModule { }