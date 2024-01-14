import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class ProcessWebhookDto {
  @IsNotEmpty()
  @IsString()
  webhookName: string;

  @IsNotEmpty()
  @IsString()
  sourceUrl: string;

  @IsOptional()
  @IsObject()
  data: object;
}
