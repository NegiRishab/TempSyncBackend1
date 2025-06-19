import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { ERRORS } from "src/common/constants";
import { UsersService } from "../users/users.service";
import { RedisService } from "src/redis/redis.service";
// import { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Controller("organization")
export class OrganizationController {
  private readonly logger = new Logger(OrganizationController.name);
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  async update(@Req() req, @Body() updateOrganization: UpdateOrganizationDto) {
    try {
      const organizationId: string = req.user.organizationId;
      const userId: string = req.user.id;
      const organization = await this.organizationService.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new HttpException(
          ERRORS.USER.ORGANIZATION_WITH_SAME_EMAIL_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.organizationService.findOneAndUpdate(
        organizationId,
        updateOrganization,
      );

      const profile = await this.userService.findOne({
        where: { id: userId },
        relations: ["organization"],
      });
      if (profile) {
        await this.redisService.set(
          `user:${userId}`,
          JSON.stringify(profile),
          3600,
        );
      }
      return { message: "organization update succesfully" };
    } catch (error) {
      this.logger.error("[UsersController]:[update]:", error);

      throw error;
    }
  }
}
