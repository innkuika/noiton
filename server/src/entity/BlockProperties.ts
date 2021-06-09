import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class BlockProperties {

    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    title: string;
}
