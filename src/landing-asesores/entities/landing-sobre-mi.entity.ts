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

@Entity({ name: 'LandingSobreMi' })
export class LandingSobreMi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  titulo: string;

  @Column('text', { nullable: true })
  paragraph: string;

  @Column('text', { nullable: true })
  imagen: string;

  @OneToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
