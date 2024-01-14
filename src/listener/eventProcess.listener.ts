import { Injectable } from '@nestjs/common';
import { ProcessWebhookEvent } from '../dto/ProcessWebhookEvent';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { WebhookService } from '../services/webhook.service';

@Injectable()
export class EventProcessListener {
  constructor(
    private readonly webhookService: WebhookService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('process.webhook')
  async processWebhookEvent(event: ProcessWebhookEvent) {
    try {
      // if (event.retryCount <= 2) {
      //   throw Error();
      // }
      await this.webhookService.processRequest(
        event.userWebhookMappingId,
        event.sourceUrl,
        event.data,
        event.retryCount,
      );
    } catch (e) {
      if (event.retryCount < event.totalRetryCount) {
        event.retryCount++;
        this.eventEmitter.emit('process.webhook', event);
      }
    }
  }
}
