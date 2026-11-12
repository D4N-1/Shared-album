import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import { Repository } from "typeorm";
import { ResAllInterface } from "../../common/interfaces/res-all.interface.js";
import { ResCreateInterface } from "../../common/interfaces/res-create.interface.js";
import { CreatePhotoDto } from "./dto/create.dto.js";
import { UpdatePhotoDto } from "./dto/update.dto.js";
import { PhotoEntity, PhotoStatus } from "./entities/photo.entity.js";


interface findAllOptions {
    limit: number|null
}

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


    findOneBy = {

        uuid: async(uuid: string): Promise<PhotoEntity> => {
            const photo = await this.photoRepository.findOne({
                where: { uuid }
            })

            if (!photo) throw new NotFoundException('No se encontró esa foto')

            return photo
        }

    }


    async savePhoto(createPhoto: CreatePhotoDto, file: Express.Multer.File): Promise<ResCreateInterface> {

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
            uuid: finalUuid,
            mimeType: file.mimetype
        })

        await this.photoRepository.save(newPhoto);


        return {
            message: 'Nueva foto guardada en local',
            data: newPhoto
        }

    }

    async updatePhoto(updatePhoto: UpdatePhotoDto): Promise<ResCreateInterface> {

        const { status } = updatePhoto;

        const photo = await this.findOneBy.uuid(updatePhoto.uuid!)

        const newData: Partial<PhotoEntity> = { ...updatePhoto }

        newData.status = status;

        const editPhoto = this.photoRepository.merge(photo, newData)

        return {
            message: 'La foto ha sido modificada con exito',
            data: await this.photoRepository.save(editPhoto)
        }
    }

    async findAllPending(options?: findAllOptions): Promise<ResAllInterface> {


        const [data, total] = await this.photoRepository.findAndCount({
            take: options?.limit ?? undefined,
            where: { status: PhotoStatus.PENDING },
            order: { index: 'ASC' }
        })

        return {
            data,
            meta: {
                total,
                count: data.length,
                perPage: 0,
                totalPages: 0,
                currentPage: 0
            }
        }
    }
}