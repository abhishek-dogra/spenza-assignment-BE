import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookService } from './services/webhook.service';
import { WebhookController } from './controllers/webhook.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { WebhookEntity } from './entities/webhook.entity';
import { WebhookUserMappingEntity } from './entities/webhook-user-mapping.entity';
import { WebhookUsageLogEntity } from './entities/webhook-usage-log.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventProcessListener } from './listener/eventProcess.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('HOST'),
        port: +configService.get('PORT'),
        username: configService.get('USERNAME'),
        password: configService.get('PASSWORD'),
        database: configService.get('DATABASE'),
        entities: [
          UserEntity,
          WebhookEntity,
          WebhookUserMappingEntity,
          WebhookUsageLogEntity,
        ],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      WebhookEntity,
      WebhookUserMappingEntity,
      WebhookUsageLogEntity,
    ]),
    JwtModule.register({}),
  ],
  controllers: [AppController, WebhookController, UserController],
  providers: [AppService, WebhookService, UserService, EventProcessListener],
})
export class AppModule {}
