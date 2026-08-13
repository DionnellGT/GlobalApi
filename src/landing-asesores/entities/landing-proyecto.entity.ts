import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'LandingProyectos' })
export class LandingProyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  imagenCaratula: string;

  @Column('text')
  nombre: string;

  @Column('text', { nullable: true })
  ubicacion: string;

  @Column('text', { nullable: true })
  precio: string;

  @Column('text', { nullable: true })
  badgeLabel: string;

  @Column('text', { nullable: true })
  badgeColor: string;

  @Column('int', { default: 0 })
  lotesDisponibles: number;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('text', { array: true, default: [] })
  caracteristicas: string[];

  @Column('text', { nullable: true })
  linkGoogleMaps: string;

  @Column('text', { nullable: true })
  link360Maps: string;

  @Column('text', { array: true, default: [] })
  imagenesPopup: string[];

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
