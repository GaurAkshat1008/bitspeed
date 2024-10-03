import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from "typeorm";

export enum LinkPrecedence {
    PRIMARY = "primary",
    SECONDARY = "secondary",
}

@Entity()
export class Contact extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: true})
    phoneNumber?: string;

    @Column({nullable: true})
    email?: string;

    @Column({nullable: true})
    linkedId?: number;

    @Column({type: "enum", enum: LinkPrecedence, default: LinkPrecedence.PRIMARY})
    linkPrecedence!: LinkPrecedence;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn({nullable: true})
    deletedAt?: Date;
}