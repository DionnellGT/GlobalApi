import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SendLog } from './send-log.entity';

@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('text') name: string;
  @Column('text', { unique: true }) email: string;
  @Column('text', { array: true, default: [] }) tags: string[];
  @Column('bool', { default: true }) isActive: boolean;
  @OneToMany(() => SendLog, (log) => log.recipient) sendLogs: SendLog[];
  @CreateDateColumn() createdAt: Date;
}
