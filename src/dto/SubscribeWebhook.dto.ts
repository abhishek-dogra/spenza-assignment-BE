import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Type } from 'class-transformer';

export class SubscribeWebhookDto {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  webhookId: number;

  @IsNotEmpty()
  @IsString()
  sourceUrl: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  retryCount: number;
}
