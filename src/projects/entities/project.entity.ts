import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectImage } from '.';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'Projects' })
export class Project {

  @ApiProperty({ example: 'uuid', description: 'PROJECT ID', uniqueItems: true })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Indica si el proyecto está activo', default: true })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Slug único del proyecto', uniqueItems: true })
  @Column('text', { unique: true })
  idSlug: string;

  @ApiProperty({ description: 'Marca o desarrolladora del proyecto' })
  @Column('text', { nullable: true })
  marca: string;

  @ApiProperty({ description: 'Nombre del proyecto' })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({ description: 'Imagen para el carrusel principal' })
  @Column('text', { nullable: true })
  imageCarrousel: string;

  @ApiProperty({ description: 'Imagen del banner principal (desktop)' })
  @Column('text', { nullable: true })
  imagenBannerPrincipal: string;

  @ApiProperty({ description: 'Imagen del banner principal (mobile)' })
  @Column('text', { nullable: true })
  imagenBannerPrincipalMobile: string;

  @ApiProperty({ description: 'Imágenes de características del proyecto', isArray: true })
  @Column('text', { array: true, default: [] })
  imagenesDeCaracteristicas: string[];

  @ApiProperty({ description: 'URL vista 360 del proyecto' })
  @Column('text', { nullable: true })
  vistaProyecto360: string;

  @ApiProperty({ description: 'Imágenes de vistas del proyecto', isArray: true })
  @Column('text', { array: true, default: [] })
  imagenesVistasProyecto: string[];

  @ApiProperty({ description: 'Imagen de fondo del mapa' })
  @Column('text', { nullable: true })
  imagenMapaFondo: string;

  @ApiProperty({ description: 'Link de Google Maps u otro mapa' })
  @Column('text', { nullable: true })
  linkMapa: string;

  @ApiProperty({ description: 'Imagen del segundo banner' })
  @Column('text', { nullable: true })
  imagenBaner2: string;

  @ApiProperty({ description: 'Centros urbanos cercanos al proyecto' })
  @Column('jsonb', { default: [] })
  centrosUrbanosCercanos: {
    nombre: string;
    distancia: string;
    tiempo: string;
    linkMaps?: string;
    imgCentroUrbano?: string;
  }[];

  @ApiProperty({ description: 'Imagen de sección de centros urbanos' })
  @Column('text', { nullable: true })
  imagenCentrosUrbanos: string;

  @ApiProperty({ description: 'Atracciones turísticas cercanas' })
  @Column('jsonb', { default: [] })
  atraccionesTuristicas: {
    nombre: string;
    tiempo: string;
    distancia: string;
    linkMaps?: string;
    imgAtraccionTuristica?: string;
  }[];

  @ApiProperty({ description: 'Imagen de sección de atracciones turísticas' })
  @Column('text', { nullable: true })
  imagenAtraccionesTuristicas: string;

  @ManyToOne(() => User, (user) => user.project, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.idSlug) {
      this.idSlug = this.name;
    }
    this.idSlug = this.idSlug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.idSlug = this.idSlug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}