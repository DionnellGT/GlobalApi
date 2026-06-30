import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { Recipient } from './recipient.entity';

export enum SendStatus {
  SENT   = 'sent',
  FAILED = 'failed',
}

@Entity('send_logs')
export class SendLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Campaign, (c) => c.sendLogs, { onDelete: 'CASCADE' }) campaign: Campaign;
  @ManyToOne(() => Recipient, (r) => r.sendLogs, { onDelete: 'SET NULL', nullable: true }) recipient: Recipient;
  @Column('text') email: string;
  @Column({ type: 'enum', enum: SendStatus }) status: SendStatus;
  @Column('text', { nullable: true }) error: string;
  @Column('text', { nullable: true }) resendId: string;
  @CreateDateColumn() sentAt: Date;
}
