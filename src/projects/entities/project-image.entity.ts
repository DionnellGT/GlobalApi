import { Project } from '.';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity({ name: 'Project_images' })
export class ProjectImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Project,
        ( project ) => project.images,
        {  onDelete: 'CASCADE' }
    )
    project: Project

}
