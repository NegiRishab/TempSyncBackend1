import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { WorkplaceController } from "./workplace.controller";
import { WorkplaceService } from "./workplace.service";
import { Workplace } from "./entities/workplace.entity";
import { Organization } from "../organization/entities/organization.entity";
import { UserEntity } from "../users/entities/user.entity";
import { WorkplaceUser } from "./entities/workplace-user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workplace,
      Organization,
      WorkplaceUser,
      UserEntity,
    ]),
  ],
  controllers: [WorkplaceController],
  providers: [WorkplaceService],
})
export class WorkplaceModule {}
