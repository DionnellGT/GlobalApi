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

export enum TestimonioTipoMedia {
  VIDEO = 'video',
  FOTO = 'foto',
}

@Entity({ name: 'LandingTestimonios' })
export class LandingTestimonio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  media: string;

  @Column({ type: 'enum', enum: TestimonioTipoMedia, nullable: true })
  tipoMedia: TestimonioTipoMedia;

  @Column('text')
  nombreTestimonio: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
