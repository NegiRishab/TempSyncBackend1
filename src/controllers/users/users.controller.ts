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
// import * as _ from "lodash";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/user.dto";
import { ERRORS } from "src/common/constants";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { UtilitiesServices } from "src/common/services/utils.services";
// import { LogEventEnum } from "src/common/enums/log.enum";
import { ConfigService } from "@nestjs/config";
// import { EMAIL_TEMPLATES } from "src/common/constants/emails";
// import { FindManyOptions } from "typeorm";
// import { UserEntity } from "./entities/user.entity";
// import { FileInterceptor } from "@nestjs/platform-express";
// import * as moment from "moment";

@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilitiesServices,
    private readonly configService: ConfigService,
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
      const id: string = req.user.id;
      const profile = await this.usersService.findOne({
        where: { id },
      });

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
      return await this.usersService.findOneAndUpdate(id, updateOption);
    } catch (error) {
      this.logger.error("[UsersController]:[update]:", error);

      throw error;
    }
  }
}
