import { IsOptional, IsUUID } from "class-validator";



export class CreatePhotoDto {

    @IsUUID()
    @IsOptional()
    uuid: string;
    
}