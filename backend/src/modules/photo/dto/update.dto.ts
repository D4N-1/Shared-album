import { PartialType } from "@nestjs/mapped-types";
import { PhotoEntity } from "../entities/photo.entity.js";


export class UpdatePhotoDto extends PartialType(PhotoEntity) { }