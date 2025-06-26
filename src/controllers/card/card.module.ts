import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CardService } from "./card.service";
import { CardController } from "./card.controller";
import { Card } from "./entities/card.entity";
import { Workplace } from "../workplace/entities/workplace.entity";
import { WorkplaceUser } from "../workplace/entities/workplace-user.entity";
import { UserEntity } from "../users/entities/user.entity";
import { Organization } from "../organization/entities/organization.entity";
import { RedisService } from "src/redis/redis.service";
import { RedisModule } from "src/redis/redis.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Card,
      Workplace,
      Organization,
      WorkplaceUser,
      UserEntity,
    ]),
    RedisModule,
  ],
  controllers: [CardController],
  providers: [CardService, RedisService],
})
export class CardModule {}
