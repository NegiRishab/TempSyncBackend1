// src/notifications/notifications.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { Notification } from "./entities/notification.entity";
import { NotificationPubSubService } from "./pubsub/notification-pubsub.service";
import { NotificationGateway } from "./gateway/notification.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationPubSubService,
    NotificationGateway,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
