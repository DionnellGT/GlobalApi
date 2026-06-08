import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProjectImage } from '.';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'Projects' })
export class Project {

    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'PROJECT ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'PROJECT Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'PROJECT price',
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
        description: 'PROJECT description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'PROJECT SLUG - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'PROJECT stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M','XL','XXL'],
        description: 'PROJECT sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'PROJECT gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    // images
    @ApiProperty()
    @OneToMany(
        () => ProjectImage,
        (projectImage) => projectImage.project,
        { cascade: true, eager: true }
    )
    images?: ProjectImage[];


    @ManyToOne(
        () => User,
        ( user ) => user.projects,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {

        if ( !this.slug ) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')

    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }


}

