import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'LandingMisDatos' })
export class LandingMisDatos {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: true })
  logo: string;

  @Column('text')
  nombre: string;

  @Column('text', { nullable: true })
  apellido: string;

  @Column('text', { nullable: true })
  correo: string;

  @Column('text', { nullable: true })
  telefono: string;

  @Column('text', { nullable: true })
  facebook: string;

  @Column('text', { nullable: true })
  instagram: string;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
