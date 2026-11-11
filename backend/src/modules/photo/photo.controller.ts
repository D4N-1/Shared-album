import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "node:fs";
import { extname } from "path";
import { CreatePhotoDto } from "./dto/create.dto.js";
import { PhotoService } from "./photo.service.js";


@Controller('photo')
export class PhotoController {

    constructor(

        private readonly photoService: PhotoService

    ) { }

    
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const uploadPath = './uploads';
                    if ( !fs.existsSync(uploadPath) ) fs.mkdirSync(uploadPath, { recursive: true });
                    callback(null, uploadPath)
                },
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round( Math.random() * 1e9);
                    callback(null, `image-${uniqueSuffix}${extname(file.originalname)}`)
                }
            }),
            fileFilter: (req, file, callback) => {

                const allowedExt = [ '.jpg', '.png', '.jpeg' ]
                const ext = extname(file.originalname).toLowerCase();

                if ( !allowedExt.includes(ext) ) {
                    return callback(
                        new BadRequestException( 'Solo se permiten archivos de imagen' ),
                    false
                    )
                }

                callback(null, true)
            },
            limits: {
                fileSize: 1024 * 1024 * 25
            }
        })
    )
    async uploadPhoto(
        @UploadedFile() file: any,
        @Body() createPhoto: CreatePhotoDto
    ) {
        return this.photoService.savePhoto(createPhoto, file)
    }


}