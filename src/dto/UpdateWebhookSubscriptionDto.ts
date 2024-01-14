import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID, Min
} from "class-validator";

export class UpdateWebhookSubscriptionDto {
  @IsNotEmpty()
  @IsUUID()
  webhookUserId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  retryCount: number;

  @IsOptional()
  @IsBoolean()
  cancel: boolean;
}
