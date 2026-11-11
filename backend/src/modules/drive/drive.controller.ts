import { Controller, Get } from "@nestjs/common";
import { DriveService } from "./drive.service.js";



@Controller('drive')
export class DriveController {

    constructor(

        private readonly driveService: DriveService

    ) { }


    @Get('verify')
    async getVerify() {
        return this.driveService.verifyAuth()
    }


}