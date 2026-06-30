import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SendLog } from '../../recipients/entities/send-log.entity';

export enum CampaignStatus {
  DRAFT     = 'draft',
  SENDING   = 'sending',
  SENT      = 'sent',
  FAILED    = 'failed',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  subject: string;

  @Column('text')
  body: string;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column('text', { nullable: true })
  templateId: string;

  @Column('int', { default: 0 })
  totalRecipients: number;

  @Column('int', { default: 0 })
  sentCount: number;

  @Column('int', { default: 0 })
  failedCount: number;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @OneToMany(() => SendLog, (log) => log.campaign, { cascade: true })
  sendLogs: SendLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
