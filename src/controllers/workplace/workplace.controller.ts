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
import { RedisService } from "src/redis/redis.service";

@Controller("workplace")
@UseGuards(AccessTokenGuard)
export class WorkplaceController {
  constructor(
    private readonly service: WorkplaceService,
    private readonly redisService: RedisService,
  ) {}

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

    const cached = await this.redisService.get(`workplaceUser:${userId}`);
    if (cached) return cached;

    const workPlaceDetails = await this.service.getMyWorkplacesByUserId(userId);

    await this.redisService.set(
      `workplaceUser:${userId}`,
      JSON.stringify(workPlaceDetails),
      3600,
    );

    return workPlaceDetails;
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
    await this.redisService.invalidateWorkplaceUsersCache(workplaceId);

    return { message: "User Added Succesfully" };
  }

  @Post("/remove/user/:id")
  async removeUSer(
    @Param("id") workplaceId: string,
    @Body() dto: AddUserToWorkplaceDto,
  ) {
    await this.service.removeUserFromWorkplace(workplaceId, dto.userId);
    await this.redisService.invalidateWorkplaceUsersCache(workplaceId);

    return { message: "User Remove Succesfully" };
  }
}
