import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkplaceService } from "./workplace.service";
import {
  AddUserToWorkplaceDto,
  CreateWorkplaceDto,
} from "./dto/create-workplace.dto";

@Controller("workplace")
@UseGuards(AuthGuard)
export class WorkplaceController {
  constructor(private readonly service: WorkplaceService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateWorkplaceDto) {
    const organizationId: string = req.user.organizationId;
    const workplaceName: string = dto.name;
    const userId: string = req.user.id;

    return this.service.createWorkplace(workplaceName, organizationId, userId);
  }

  @Get()
  async myWorkplaces(@Req() req) {
    const userId: string = req.user.id;
    return this.service.getMyWorkplacesByUserId(userId);
  }

  @Post("/add/user/:id")
  async addUser(
    @Param("id") workplaceId: string,
    @Body() dto: AddUserToWorkplaceDto,
  ) {
    return this.service.addUser(workplaceId, dto.userId);
  }

  @Delete("/remove/user/:id")
  async removeUSer(
    @Param("id") workplaceId: string,
    @Body() dto: AddUserToWorkplaceDto,
  ) {
    return this.service.addUser(workplaceId, dto.userId);
  }
}
