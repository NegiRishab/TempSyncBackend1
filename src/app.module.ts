import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./controllers/users/users.module";
import { AuthModule } from "./controllers/auth/auth.module";
import { DataSourceOptions } from "typeorm";
import { OrganizationModule } from "./controllers/organization/organization.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log("process.env ", process.env);
        const DB_ENTITIES: string =
          configService.get("DB_ENTITIES") ?? "dist/**/*.entity.js";
        const DB_MIGRATIONS: string =
          configService.get("DB_MIGRATIONS") ?? "dist/migrations/*.js";
        let sslConfig = {};
        if (process.env.NODE_ENV === "local") {
          sslConfig = false;
        }
        const dbOptions: DataSourceOptions = {
          type: "postgres",
          url: configService.get<string>("DB_URL"),
          synchronize: false,
          ssl: sslConfig,
          logging: configService.get("DB_LOGGING"),
          entities: [DB_ENTITIES],
          migrations: [DB_MIGRATIONS],
        };
        console.log("dbOptions ", dbOptions);
        return dbOptions;
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
