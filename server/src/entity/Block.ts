import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, PrimaryColumn} from "typeorm";
import {BlockProperties} from "./BlockProperties";

@Entity()
export class Block {

    // @PrimaryGeneratedColumn()
    // id: number;

    // @Column()
    @PrimaryColumn()
    uuid: string;

    @OneToOne(type => BlockProperties, {
        cascade: true,
    })
    @JoinColumn()
    properties: BlockProperties;

    // @Column("array")
    // content: number;
}
