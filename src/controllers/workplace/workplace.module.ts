import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { WorkplaceController } from "./workplace.controller";
import { WorkplaceService } from "./workplace.service";
import { Workplace } from "./entities/workplace.entity";
import { Organization } from "../organization/entities/organization.entity";
import { UserEntity } from "../users/entities/user.entity";
import { WorkplaceUser } from "./entities/workplace-user.entity";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workplace,
      Organization,
      WorkplaceUser,
      UserEntity,
    ]),
    RedisModule,
  ],
  controllers: [WorkplaceController],
  providers: [WorkplaceService, RedisService],
})
export class WorkplaceModule {}
