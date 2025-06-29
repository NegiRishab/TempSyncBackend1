import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./controllers/users/users.module";
import { AuthModule } from "./controllers/auth/auth.module";
import { OrganizationModule } from "./controllers/organization/organization.module";
import { DataSourceOptions } from "typeorm";
import { RedisModule } from "./redis/redis.module";
import { InvitationsModule } from "./invitations/invitations.module";
import { WorkplaceModule } from "./controllers/workplace/workplace.module";
import { CardModule } from "./controllers/card/card.module";
import { NotificationsModule } from "./controllers/notifications/notifications.module";
import { CloudinaryModule } from "./controllers/cloudinary/cloudinary.module";
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isLocal = configService.get<string>("NODE_ENV") === "local";

        const dbOptions: DataSourceOptions = {
          type: "postgres",
          url: configService.get<string>("DB_URL"),
          synchronize: false,
          logging: configService.get<string>("DB_LOGGING") === "true",
          ssl: isLocal
            ? false
            : {
                rejectUnauthorized: false,
              },
          entities: [
            configService.get<string>("DB_ENTITIES") || "dist/**/*.entity.js",
          ],
          migrations: [
            configService.get<string>("DB_MIGRATIONS") ||
              "dist/migrations/*.js",
          ],
        };

        return dbOptions;
      },
    }),

    UsersModule,
    AuthModule,
    OrganizationModule,
    RedisModule,
    InvitationsModule,
    WorkplaceModule,
    CardModule,
    NotificationsModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
