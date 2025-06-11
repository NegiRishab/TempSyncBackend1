import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { UserTokenService } from "./user-token.service";
import { UserTokensEntity } from "./entities/userTokens.entity";
import { UtilsModule } from "src/common/services/utils.module";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserTokensEntity]),
    UtilsModule,
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserTokenService, RedisService],
  exports: [UsersService, UserTokenService],
})
export class UsersModule {}
