import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { WorkplaceService } from "./workplace.service";
import {
  AddUserToWorkplaceDto,
  CreateWorkplaceDto,
} from "./dto/create-workplace.dto";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";

@Controller("workplace")
@UseGuards(AccessTokenGuard)
export class WorkplaceController {
  constructor(private readonly service: WorkplaceService) {}

  @Post("/create")
  async create(@Req() req, @Body() dto: CreateWorkplaceDto) {
    const organizationId: string = req.user.organizationId;
    const workplaceName: string = dto.name;
    const userId: string = req.user.id;

    return this.service.createWorkplace(workplaceName, organizationId, userId);
  }

  @Get("my")
  async myWorkplaces(@Req() req) {
    const userId: string = req.user.id;
    return this.service.getMyWorkplacesByUserId(userId);
  }

  @Get("users/:workPlaceId")
  async workPlaceUsers(@Param("workPlaceId") workPlaceId: string) {
    return this.service.getWorkPlaceUsers(workPlaceId);
  }

  @Post("/add/user/:id")
  async addUser(
    @Param("id") workplaceId: string,
    @Body() dto: AddUserToWorkplaceDto,
  ) {
    await this.service.addUser(workplaceId, dto.userId);
    return { message: "User Added Succesfully" };
  }

  @Post("/remove/user/:id")
  async removeUSer(
    @Param("id") workplaceId: string,
    @Body() dto: AddUserToWorkplaceDto,
  ) {
    await this.service.removeUserFromWorkplace(workplaceId, dto.userId);
    return { message: "User Remove Succesfully" };
  }
}
