// src/notifications/pubsub/notification-pubsub.service.ts
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { Server } from "socket.io";

@Injectable()
export class NotificationPubSubService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationPubSubService.name);

  private pub: Redis;
  private sub: Redis;
  private server: Server;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is not defined in environment variables");
    }

    // Initialize Redis clients
    this.pub = new Redis(redisUrl);
    this.sub = new Redis(redisUrl);
  }

  setServer(server: Server) {
    this.server = server;
  }

  async subscribeToChannel(channel: string) {
    try {
      await this.sub.subscribe(channel);
      this.logger.log(`Subscribed to channel: ${channel}`);
    } catch (err) {
      this.logger.error(`Subscribe failed for ${channel}`, err);
    }

    this.sub.on("message", (channel: string, message: string) => {
      this.logger.debug(`Message received on ${channel}: ${message}`);

      try {
        const data = JSON.parse(message);

        if (this.server && data?.userId) {
          this.server.to(`user:${data.userId}`).emit("newNotification", data);
          this.logger.debug(`Emitted notification to room user:${data.userId}`);
        } else {
          this.logger.warn(`Invalid message or missing userId: ${message}`);
        }
      } catch (err) {
        this.logger.error(`Failed to parse message on ${channel}`, err);
      }
    });
  }

  async publish(channel: string, payload: any) {
    try {
      const message = JSON.stringify(payload);
      await this.pub.publish(channel, message);
      this.logger.debug(`Published to ${channel}: ${message}`);
    } catch (err) {
      this.logger.error(`Failed to publish to ${channel}`, err);
    }
  }

  onModuleDestroy() {
    this.pub.disconnect();
    this.sub.disconnect();
    this.logger.log("Redis PubSub connections closed");
  }
}
