import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, PrimaryColumn} from "typeorm";
import {BlockProperties} from "./BlockProperties";

@Entity()
export class Block {
    @PrimaryColumn()
    uuid: string;

    @Column()
    type: string;

    @Column()
    parent: string

    @OneToOne(type => BlockProperties, {
        cascade: true,
    })
    @JoinColumn()
    properties: BlockProperties;

    @Column("simple-array")
    content: string[];

    p
}
