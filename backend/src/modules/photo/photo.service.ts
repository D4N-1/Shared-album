import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import { Repository } from "typeorm";
import { ResCreateInterface } from "../../common/interfaces/res-create.interface.js";
import { CreatePhotoDto } from "./dto/create.dto.js";
import { PhotoEntity } from "./entities/photo.entity.js";



@Injectable()
export class PhotoService {
    

    constructor(

        @InjectRepository(PhotoEntity)
        private readonly photoRepository: Repository<PhotoEntity>
        
    ) { }


    findOrNull = {

        uuid: async(uuid: string): Promise<PhotoEntity|null> => {
            return this.photoRepository.findOne({
                where: { uuid }
            })
        }

    }


    async savePhoto(createPhoto: CreatePhotoDto, file: any): Promise<ResCreateInterface> {

        const { uuid= null } = createPhoto;

        if ( !file ) throw new BadRequestException( { statusCode: 400, error: 'Bad Request', message: 'Se requiere el file de la foto a guardar' } )
        
        const photo = uuid ? await this.findOrNull.uuid(uuid) : null;
        if (photo) {
            await fs.unlink(file.path).catch(() => {})
            return {
                message: 'Foto ya guardada',
                data: photo
            }
        }

        const finalUuid = uuid || randomUUID();

        const newPhoto = this.photoRepository.create({
            name: file.filename,
            uuid: finalUuid
        })

        await this.photoRepository.save(newPhoto);


        return {
            message: 'Nueva foto guardada en local',
            data: newPhoto
        }

    }
}