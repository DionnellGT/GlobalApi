import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Project } from './project.entity';

@Entity({ name: 'atracciones_turisticas' })
export class AtraccionTuristica {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('text')
  nombre: string;

  @ApiProperty()
  @Column('text')
  distancia: string;

  @ApiProperty()
  @Column('text')
  tiempo: string;

  @ApiProperty({ required: false })
  @Column('text', { nullable: true })
  linkMaps: string;

  @ApiProperty({ required: false })
  @Column('text', { nullable: true })
  imgAtraccionTuristica: string;

  @ManyToOne(() => Project, (project) => project.atraccionesTuristicas, { onDelete: 'CASCADE' })
  project: Project;
}