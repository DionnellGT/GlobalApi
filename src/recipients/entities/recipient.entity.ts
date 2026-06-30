import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SendLog } from './send-log.entity';

@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  email: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column('bool', { default: true })
  isActive: boolean;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @OneToMany(() => SendLog, (log) => log.recipient)
  sendLogs: SendLog[];

  @CreateDateColumn()
  createdAt: Date;
}
