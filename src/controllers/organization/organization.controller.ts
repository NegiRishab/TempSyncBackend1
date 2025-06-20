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
  Get,
  Patch,
  Param,
} from "@nestjs/common";
import { OrganizationService } from "./organization.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { UpdateOrganizationDto } from "./dto/update-organization.dto";
import { ERRORS } from "src/common/constants";
import { UsersService } from "../users/users.service";
import { RedisService } from "src/redis/redis.service";
import { UserRoleEnum } from "src/common/enums";
import { Not } from "typeorm";
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

  @Get("/users")
  @UseGuards(AccessTokenGuard)
  async getOrganizationUsers(@Req() req) {
    try {
      const organizationId: string = req.user.organizationId;
      const userId: string = req.user.id;

      const user = await this.userService.findOne({ where: { id: userId } });

      if (user?.role !== UserRoleEnum.owner) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_ALLOWED_FOR_THIS_ACTION,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userFilterOptions = {
        where: {
          organization: { id: organizationId },
          role: Not(UserRoleEnum.owner),
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
        },
      };

      const organizationUsers = await this.userService.find(userFilterOptions);

      return organizationUsers;
    } catch (error) {
      this.logger.error("[OrganizationController]:[getUsers]:", error);

      throw error;
    }
  }

  @Patch("/users/:id/role")
  @UseGuards(AccessTokenGuard)
  async updateUserRole(
    @Body("role") newRole: UserRoleEnum,
    @Param("id") userId: string,
  ) {
    try {
      const user = await this.userService.findOne({ where: { id: userId } });
      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const updateOption = {
        role: newRole,
      };
      await this.userService.findOneAndUpdate(userId, updateOption);
      return { message: "user role update succesfully" };
    } catch (error) {
      this.logger.error("[OrganizationController]:[updateUserRole]:", error);

      throw error;
    }
  }
}
