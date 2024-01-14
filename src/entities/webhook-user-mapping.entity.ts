import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookEntity } from './webhook.entity';

@Entity('webhook_user', { schema: 'spenza_challenge' })
export class WebhookUserMappingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'webhook_id' })
  webhookId: number;

  @Column('jsonb', { name: 'source_url', default: [] })
  sourceUrl: string[];

  @Column({ name: 'active' })
  active: boolean;

  @Column({ name: 'retry_count' })
  retryCount: number;

  @ManyToOne(() => WebhookEntity, (webhook) => webhook.id, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'webhook_id', referencedColumnName: 'id' })
  webhook: WebhookEntity;

  constructor(
    userId: string,
    webhookId: number,
    sourceUrl: string[],
    active: boolean,
  ) {
    this.userId = userId;
    this.webhookId = webhookId;
    this.sourceUrl = sourceUrl;
    this.active = active;
  }
}
