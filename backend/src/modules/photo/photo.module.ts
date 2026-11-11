import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PhotoEntity } from "./entities/photo.entity.js";
import { PhotoController } from "./photo.controller.js";
import { PhotoService } from "./photo.service.js";



@Module({
    imports: [
        TypeOrmModule.forFeature([PhotoEntity])
    ],
    controllers: [ PhotoController ],
    providers: [ PhotoService ]
})
export class PhotoModule { }