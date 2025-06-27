import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Notification } from "./entities/notification.entity";
import { NotificationPubSubService } from "./pubsub/notification-pubsub.service";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    private readonly pubsubService: NotificationPubSubService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification: Notification = this.notificationRepo.create({
      ...dto,
    });
    const notificationDetails = await this.notificationRepo.save(notification);
    await this.pubsubService.publish("notifications", {
      userId: dto.userId,
      type: dto.type,
      message: dto.message,
      metadata: dto.metadata,
      createdAt: notificationDetails.createdAt,
    });
    return;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await this.notificationRepo.findOneBy({ id });
    if (!notification) return null;

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }
}
