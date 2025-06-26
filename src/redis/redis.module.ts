import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkplaceUser } from "src/controllers/workplace/entities/workplace-user.entity";

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([WorkplaceUser])],
  providers: [RedisService],
  exports: [RedisService, TypeOrmModule],
})
export class RedisModule {}
