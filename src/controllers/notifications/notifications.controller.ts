import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Controller("notifications")
@UseGuards(AccessTokenGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() dto: CreateNotificationDto) {
    await this.notificationsService.create(dto);
    return { message: "Notification created succesfully" };
  }

  @Get()
  getAll(
    @Query("userId") userId: string,
    @Query("page") page = 1,
    @Query("limit") limit = 10,
  ) {
    return this.notificationsService.findAll(
      userId,
      Number(page),
      Number(limit),
    );
  }

  @Patch(":id/read")
  markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Get("unread-count")
  getUnreadCount(@Query("userId") userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }
}
