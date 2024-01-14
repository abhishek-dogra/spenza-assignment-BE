import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookUserMappingEntity } from './webhook-user-mapping.entity';

@Entity('webhook_usage_log', { schema: 'spenza_challenge' })
export class WebhookUsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_webhook_id' })
  userWebhookId: string;

  @Column({ name: 'source_url' })
  sourceUrl: string;

  @Column({ name: 'timestamp' })
  timestamp: Date;

  @Column('jsonb', { name: 'data', default: {} })
  data: object;

  @Column({ name: 'retries' })
  retries: number;

  @ManyToOne(() => WebhookUserMappingEntity, (webhookUser) => webhookUser.id, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_webhook_id', referencedColumnName: 'id' })
  webhookUser: WebhookUserMappingEntity;

  constructor(
    userWebhookId: string,
    sourceUrl: string,
    data: object,
    retries: number,
  ) {
    this.userWebhookId = userWebhookId;
    this.sourceUrl = sourceUrl;
    this.data = data;
    this.retries = retries;
    this.timestamp = new Date();
  }
}
