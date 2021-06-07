import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import {BlockProperties} from "./BlockProperties";

@Entity()
export class Block {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => BlockProperties)
    @JoinColumn()
    properties: BlockProperties;

    // @Column("array")
    // content: number;
}
