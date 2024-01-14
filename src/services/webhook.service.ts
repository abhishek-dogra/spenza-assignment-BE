import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    private readonly webhookUsageLogRepository: Repository<WebhookUsageLogEntity>, // private eventEmitter: EventEmitter2,
  ) {}

  async getWebhooksList(): Promise<WebhookEntity[]> {
    return await this.webhookRepository.find();
  }

  async createUserWebhookMapping(
    user: UserEntity,
    webhook: WebhookEntity,
    userWebhookMapping: WebhookUserMappingEntity,
    sourceUrl: string[],
  ) {
    let webhookUserMapping: WebhookUserMappingEntity = null;
    if (userWebhookMapping == null) {
      webhookUserMapping = new WebhookUserMappingEntity(
        user.id,
        webhook.id,
        sourceUrl,
        true,
      );
    } else {
      webhookUserMapping = userWebhookMapping;
      webhookUserMapping.active = true;
      webhookUserMapping.sourceUrl = sourceUrl;
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
    });
  }

  async getWebhookByName(name: string) {
    return await this.webhookRepository.findOne({ where: { name: name } });
  }

  async getWebhookUserMappingByWebhookIdAndUserId(id: number, userId: string) {
    return await this.webhookUserMappingRepository.findOne({
      where: { webhookId: id, userId: userId },
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
