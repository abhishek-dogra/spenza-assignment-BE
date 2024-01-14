import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { WebhookEntity } from '../entities/webhook.entity';
import { UserEntity } from '../entities/user.entity';
import { WebhookUserMappingEntity } from '../entities/webhook-user-mapping.entity';
import { WebhookUsageLogEntity } from '../entities/webhook-usage-log.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
    @InjectRepository(WebhookUserMappingEntity)
    private readonly webhookUserMappingRepository: Repository<WebhookUserMappingEntity>,
    @InjectRepository(WebhookUsageLogEntity)
    private readonly webhookUsageLogRepository: Repository<WebhookUsageLogEntity>,
  ) {}

  async getWebhooksList(): Promise<WebhookEntity[]> {
    return await this.webhookRepository.find({ order: { id: 'asc' } });
  }

  async createUserWebhookMapping(
    user: UserEntity,
    webhook: WebhookEntity,
    userWebhookMapping: WebhookUserMappingEntity,
    sourceUrl: string,
    retryCount: number,
  ) {
    let webhookUserMapping: WebhookUserMappingEntity;
    if (userWebhookMapping == null) {
      webhookUserMapping = new WebhookUserMappingEntity(
        user.id,
        webhook.id,
        sourceUrl,
        retryCount,
        true,
      );
    } else {
      webhookUserMapping = userWebhookMapping;
      webhookUserMapping.active = true;
    }
    return this.webhookUserMappingRepository.save(webhookUserMapping);
  }

  async findWebhookFromId(id: number) {
    return await this.webhookRepository.findOne({ where: { id: id } });
  }

  async getWebhooksByUserId(userId: string) {
    return await this.webhookUserMappingRepository.find({
      where: { userId: userId, active: true },
      relations: ['webhook'],
      order: { createdAt: 'asc' },
    });
  }

  async getWebhookByName(name: string) {
    return await this.webhookRepository.findOne({
      where: { name: name },
    });
  }

  async getWebhookUserMappingByWebhookIdAndUserId(
    id: number,
    sourceUrl: string,
    userId: string,
  ) {
    return await this.webhookUserMappingRepository.findOne({
      where: { webhookId: id, sourceUrl: ILike(sourceUrl), userId: userId },
    });
  }

  async getWebhookUserMappingById(id: string) {
    return await this.webhookUserMappingRepository.findOne({
      where: { id: id },
    });
  }

  async saveUserWebhookMapping(userWebhookMapping: WebhookUserMappingEntity) {
    return await this.webhookUserMappingRepository.save(userWebhookMapping);
  }

  async getWebhooksLogsList(userId: string) {
    return await this.webhookUsageLogRepository.find({
      where: { webhookUser: { userId: userId } },
      relations: ['webhookUser', 'webhookUser.webhook'],
      order: { timestamp: 'desc' },
    });
  }

  async processRequest(
    userWebhookMappingId: string,
    sourceUrl: string,
    data: object,
    retries: number,
  ) {
    const webhookLog = new WebhookUsageLogEntity(
      userWebhookMappingId,
      sourceUrl,
      data,
      retries,
    );
    await this.webhookUsageLogRepository.save(webhookLog);
  }
}
