import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateWebhookSubscriptionDto {
  @IsNotEmpty()
  @IsUUID()
  webhookUserId: string;

  @IsOptional()
  @IsString({ each: true })
  sourceUrls: string[];

  @IsOptional()
  @IsBoolean()
  cancel: boolean;
}
