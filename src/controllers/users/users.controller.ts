import {
  Controller,
  Get,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Put,
  Logger,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/user.dto";
import { ERRORS } from "src/common/constants";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { UtilitiesServices } from "src/common/services/utils.services";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "src/redis/redis.service";

@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilitiesServices,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}
  /**
   * get user profile
   * @param id
   * @returns
   */
  @Get()
  @UseGuards(AccessTokenGuard)
  async profile(@Req() req) {
    try {
      const userId: string = req.user.id;

      const cached = await this.redisService.get(`user:${userId}`);
      if (cached) return cached;

      const profile = await this.usersService.findOne({
        where: { id: userId },
        relations: ["organization"],
      });

      if (!profile) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.redisService.set(
        `user:${userId}`,
        JSON.stringify(profile),
        3600,
      );

      return profile;
    } catch (error) {
      this.logger.error("[UsersController]:[profile]:", error);
      throw error;
    }
  }
  /**
   * update user details
   * @param req
   * @param body
   * @returns
   */
  @Put()
  @UseGuards(AccessTokenGuard)
  async update(@Req() req, @Body() updateUser: UpdateUserDto) {
    try {
      const id: string = req.user.id;
      const user = await this.usersService.findOne({
        where: { id },
      });
      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const updateOption = {
        ...updateUser,
      };
      //if password is updating then store password as encrypted
      if (updateUser?.password) {
        updateOption.password = this.utilService.encodePassword(
          updateUser.password,
        );
      }
      await this.usersService.findOneAndUpdate(id, updateOption);
      const profile = await this.usersService.findOne({
        where: { id },
        relations: ["organization"],
      });
      if (profile) {
        await this.redisService.set(
          `user:${id}`,
          JSON.stringify(profile),
          3600,
        );
      }
      return { message: "User updated succesfully" };
    } catch (error) {
      this.logger.error("[UsersController]:[update]:", error);

      throw error;
    }
  }
}
