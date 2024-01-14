import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubscribeWebhookDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  webhookId: number;

  @IsNotEmpty()
  @IsString({ each: true })
  sourceUrls: string[];
}
