// src/notifications/gateway/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { NotificationPubSubService } from "../pubsub/notification-pubsub.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly pubsubService: NotificationPubSubService) {}
  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async afterInit(): Promise<void> {
    this.logger.log("WebSocket Initialized");
    this.pubsubService.setServer(this.server);

    try {
      await this.pubsubService.subscribeToChannel("notifications");
    } catch (err) {
      this.logger.error("Failed to subscribe to channel", err);
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const userId = client.handshake.query.userId;

    if (typeof userId === "string") {
      try {
        await client.join(`user:${userId}`);
        this.logger.log(`Client connected: ${client.id} (userId: ${userId})`);
      } catch (err) {
        this.logger.error(`Failed to join room for userId ${userId}`, err);
      }
    } else {
      this.logger.warn(
        `Client ${client.id} connected without valid userId. Query: ${JSON.stringify(
          client.handshake.query,
        )}`,
      );
    }
  }
}
