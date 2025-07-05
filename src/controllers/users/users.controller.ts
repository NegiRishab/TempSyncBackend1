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
  UseInterceptors,
  UploadedFile,
  Param,
  Post,
  ParseUUIDPipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/user.dto";
import { ERRORS } from "src/common/constants";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { UtilitiesServices } from "src/common/services/utils.services";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "src/redis/redis.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Express } from "express";

@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly utilService: UtilitiesServices,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get user profile
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
   * Update user details
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

      const updateOption = { ...updateUser };

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

      return { message: "User updated successfully" };
    } catch (error) {
      this.logger.error("[UsersController]:[update]:", error);
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  @Post(":id/upload-image")
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadProfileImage(
    @Param("id", ParseUUIDPipe) userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file.buffer,
        `users/${userId}`,
      );

      await this.usersService.findOneAndUpdate(userId, {
        profile_image_url: uploadResult.secure_url,
      });

      return {
        message: "Profile image uploaded successfully",
        url: uploadResult.secure_url,
      };
    } catch (error) {
      this.logger.error("[UsersController]:[uploadProfileImage]:", error);
      throw new HttpException(
        "Image upload failed",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("getuser-details")
  async getUsersDetails(@Body() getusers: { ids: string[] }) {
    const users = await this.usersService.getMultipleUsers(getusers?.ids);
    return users;
  }
}
