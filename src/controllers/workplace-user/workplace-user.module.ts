import { Module } from "@nestjs/common";
import { WorkplaceUserService } from "./workplace-user.service";
import { WorkplaceUserController } from "./workplace-user.controller";

@Module({
  controllers: [WorkplaceUserController],
  providers: [WorkplaceUserService],
})
export class WorkplaceUserModule {}
