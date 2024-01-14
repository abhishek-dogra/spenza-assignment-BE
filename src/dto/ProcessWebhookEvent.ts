export class ProcessWebhookEvent {
  userWebhookMappingId: string;
  sourceUrl: string;
  data: object;
  totalRetryCount: number;
  retryCount: number;
}
