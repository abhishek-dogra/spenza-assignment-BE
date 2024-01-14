import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({ name: 'source_url' })
  sourceUrl: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(
    userId: string,
    webhookId: number,
    sourceUrl: string,
    retryCount: number,
    active: boolean,
  ) {
    this.userId = userId;
    this.webhookId = webhookId;
    this.sourceUrl = sourceUrl;
    this.retryCount = retryCount;
    this.active = active;
  }
}
