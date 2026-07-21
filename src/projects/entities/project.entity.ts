import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';
import { CentroUrbano } from './centro-urbano.entity';
import { AtraccionTuristica } from './atraccion-turistica.entity';
import { Marca } from '../enums';

@Entity({ name: 'Projects' })
@Unique('UQ_orden_marca', ['orden', 'marca'])   // ← orden único por marca
export class Project {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Orden de visualización del proyecto', default: 0 })
  @Column('int', { default: 0 })
  orden: number; 

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { unique: true })
  idSlug: string;

  @Column({ type: 'enum', enum: Marca, nullable: true })
  marca: Marca;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  preciosDesde: string;
  
  @Column('text', { nullable: true })
  badgeColor: string;

  @Column('text', { nullable: true })
  badgeLabel: string;

  @Column('text', { nullable: true })
  imageCarrousel: string;

  @Column('text', { nullable: true })
  imagenBannerPrincipal: string;

  @Column('text', { nullable: true })
  imagenBannerPrincipalMobile: string;

  @Column('text', { array: true, default: [] })
  imagenesDeCaracteristicas: string[];

  @Column('text', { nullable: true })
  vistaProyecto360: string;

  @Column('text', { array: true, default: [] })
  imagenesVistasProyecto: string[];

  @Column('text', { nullable: true })
  imagenMapaFondo: string;

  @Column('text', { nullable: true })
  linkMapa: string;

  @Column('text', { nullable: true })
  imagenBaner2: string;

  @Column('text', { nullable: true })
  imagenCentrosUrbanos: string;

  @Column('text', { nullable: true })
  imagenAtraccionesTuristicas: string;

  // ← Relaciones reemplazando jsonb
  @OneToMany(() => CentroUrbano, (c) => c.project, { cascade: true, eager: true })
  centrosUrbanosCercanos: CentroUrbano[];

  @OneToMany(() => AtraccionTuristica, (a) => a.project, { cascade: true, eager: true })
  atraccionesTuristicas: AtraccionTuristica[];

  @ManyToOne(() => User, (user) => user.project, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.idSlug) this.idSlug = this.name;
    this.idSlug = this.idSlug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.idSlug = this.idSlug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
  }
}