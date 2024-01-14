import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { TokenGuard } from '../guards/token.guard';
import { WebhookEntity } from '../entities/webhook.entity';
import { SubscribeWebhookDto } from '../dto/SubscribeWebhook.dto';
import { UserService } from '../services/user.service';
import { ProcessWebhookDto } from '../dto/ProcessWebhook.dto';
import { UpdateWebhookSubscriptionDto } from '../dto/UpdateWebhookSubscriptionDto';
import { ProcessWebhookEvent } from '../dto/ProcessWebhookEvent';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiKeyGuard } from '../guards/ApiKey.guard';
import { CommonService } from '../services/common.service';
import { ConfigService } from '@nestjs/config';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
    private commonService: CommonService,
    private configService: ConfigService,
  ) {}

  @UseGuards(TokenGuard)
  @Get()
  async getWebhooksList(): Promise<{ data: WebhookEntity[] }> {
    const data = await this.webhookService.getWebhooksList();
    return { data: data };
  }

  @UseGuards(TokenGuard)
  @Post('subscribe')
  async subscribeWebhook(
    @Headers('user-id') userId: string,
    @Body() webhookSubscribeDto: SubscribeWebhookDto,
  ) {
    this.checkUserId(userId);
    const webhook = await this.webhookService.findWebhookFromId(
      webhookSubscribeDto.webhookId,
    );
    if (webhook == null) {
      throw new HttpException(
        { message: 'Webhook not found.' },
        HttpStatus.NOT_FOUND,
      );
    }
    const user = await this.userService.findUserFromId(userId);
    if (user == null) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const userWebhookMapping =
      await this.webhookService.getWebhookUserMappingByWebhookIdAndUserId(
        webhook.id,
        webhookSubscribeDto.sourceUrl,
        userId,
      );
    if (userWebhookMapping != null && userWebhookMapping.active === true) {
      throw new HttpException(
        {
          message: 'Webhook for this source already exists for this user.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.webhookService.createUserWebhookMapping(
      user,
      webhook,
      userWebhookMapping,
      webhookSubscribeDto.sourceUrl,
      webhookSubscribeDto.retryCount,
    );
    return {
      success: true,
    };
  }

  @UseGuards(TokenGuard)
  @Put('subscription')
  async updateWebhookSubscription(
    @Headers('user-id') userId: string,
    @Body() updateWebhookDto: UpdateWebhookSubscriptionDto,
  ) {
    this.checkUserId(userId);
    const user = await this.userService.findUserFromId(userId);
    if (user == null) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const userWebhookMapping =
      await this.webhookService.getWebhookUserMappingById(
        updateWebhookDto.webhookUserId,
      );
    if (userWebhookMapping == null) {
      throw new HttpException(
        { message: 'Webhook not subscribed by the User.' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (userWebhookMapping.userId != userId) {
      throw new HttpException(
        { message: 'User cannot update subscription.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (updateWebhookDto.retryCount != null) {
      userWebhookMapping.retryCount = updateWebhookDto.retryCount;
    }
    if (updateWebhookDto.cancel != null && updateWebhookDto.cancel == true) {
      userWebhookMapping.active = false;
    }
    await this.webhookService.saveUserWebhookMapping(userWebhookMapping);
    return {
      success: true,
    };
  }

  @UseGuards(TokenGuard)
  @Get('subscribed')
  async fetchSubscribedWebhooksList(@Headers('user-id') userId: string) {
    this.checkUserId(userId);
    const userWebhookMapping = await this.webhookService.getWebhooksByUserId(
      userId,
    );
    return { data: userWebhookMapping };
  }

  @UseGuards(ApiKeyGuard)
  @Post('process')
  async processWebhook(
    @Headers('whs-secret-key') authKey: string,
    @Body() processWebhookDto: ProcessWebhookDto,
  ) {
    const userId = this.checkAndDecipherAuthKey(authKey);
    this.checkUserId(userId);
    const webhook = await this.webhookService.getWebhookByName(
      processWebhookDto.webhookName,
    );
    if (webhook == null) {
      throw new HttpException(
        { message: 'Webhook not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const userWebhookMapping =
      await this.webhookService.getWebhookUserMappingByWebhookIdAndUserId(
        webhook.id,
        processWebhookDto.sourceUrl,
        userId,
      );
    if (userWebhookMapping == null) {
      throw new HttpException(
        { message: 'User is not subscribed to this webhook.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const processWebhookEvent = new ProcessWebhookEvent();
    processWebhookEvent.userWebhookMappingId = userWebhookMapping.id;
    processWebhookEvent.data = processWebhookDto.data;
    processWebhookEvent.sourceUrl = processWebhookDto.sourceUrl;
    processWebhookEvent.retryCount = 0;
    processWebhookEvent.totalRetryCount = userWebhookMapping.retryCount;
    this.eventEmitter.emit('process.webhook', processWebhookEvent);
    return { success: true };
  }

  @UseGuards(TokenGuard)
  @Get('logs')
  async fetchWebhooksLogList(@Headers('user-id') userId: string) {
    this.checkUserId(userId);
    const webhookLogs = await this.webhookService.getWebhooksLogsList(userId);
    return { data: webhookLogs };
  }

  private checkUserId(userId: string) {
    if (userId == null) {
      throw new HttpException(
        { message: 'User Id not provided.' },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private checkAndDecipherAuthKey(authKey: string) {
    const authKeySecret = this.configService.get<string>('AUTH_KEY_SECRET');
    try {
      const decryptedKey = this.commonService.decrypt(authKey, authKeySecret);
      return decryptedKey.split('_').at(1);
    } catch (e) {
      throw new HttpException(
        { message: `Invalid Auth Key.` },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
