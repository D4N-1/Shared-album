import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";


export enum PhotoStatus {
    PENDING = 'PENDING',
    SYNCED = 'SYNCED',
    FAILED = 'FAILED'
}


@Entity('photo')
export class PhotoEntity {

    @PrimaryGeneratedColumn('increment')
    index: number;

    @Column({ unique: true })
    @Generated('uuid')
    uuid: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: PhotoStatus, default: PhotoStatus.PENDING })
    status: PhotoStatus;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

}