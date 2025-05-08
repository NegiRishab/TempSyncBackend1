import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
  Logger,
  UseGuards,
  Req,
  Res,
  Get,
} from "@nestjs/common";
import { UsersService } from "../../controllers/users/users.service";
import { SigInDto, SignUpDto } from "./dto/auth.dto";
import { ERRORS } from "src/common/constants";
import { UtilitiesServices } from "src/common/services/utils.services";
// import { FindOneOptions } from "typeorm";
import { AuthService } from "./auth.service";
// import { AccessTokenGuard } from "./guards/accessToken.guard";
import { UserTokenService } from "../users/user-token.service";
import { ConfigService } from "@nestjs/config";
import { OrganizationService } from "../organization/organization.service";
import { UserRoleEnum } from "src/common/enums";
import { FindOneOptions } from "typeorm";
import { UserEntity } from "../users/entities/user.entity";
// import { AccessTokenGuard } from "./guards/accessToken.guard";
import { RefreshTokenGuard } from "./guards/refreshToken.guard";
import { Response } from "express";
import { AccessTokenGuard } from "./guards/accessToken.guard";
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly userTokensService: UserTokenService,
    private readonly utilService: UtilitiesServices,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly organizationService: OrganizationService,
  ) {}

  /**
   * Create new account and user
   * @param createUserDto
   * @returns
   */
  @HttpCode(HttpStatus.CREATED)
  @Post("sign-up")
  async signUp(
    @Body() createUserDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const existingOrganization = await this.organizationService.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingOrganization) {
        throw new HttpException(
          ERRORS.USER.ORGANIZATION_WITH_SAME_EMAIL_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.usersService.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new HttpException(
          ERRORS.USER.USER_WITH_SAME_EMAIL_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      const createOrganizationPayload = {
        name: createUserDto.organizationName,
        phone: createUserDto.phone,
        address: createUserDto.address,
        email: createUserDto.email.toLowerCase(),
      };

      const organizationDetails = await this.organizationService.create(
        createOrganizationPayload,
      );

      const createUserPayload = {
        first_name: createUserDto.firstName,
        last_name: createUserDto.lastName,
        email: createUserDto.email.toLowerCase(),
        password: this.utilService.encodePassword(createUserDto.password),
        role: UserRoleEnum.owner,
        organization: organizationDetails,
      };

      const createdUser = await this.usersService.create(createUserPayload);

      const tokens = await this.authService.generateTokens({
        id: createdUser.id,
        email: createdUser.email,
        organizationId: organizationDetails.id,
      });

      await this.userTokensService.createToken(
        createdUser.id,
        tokens.refreshToken,
      );
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: {
          firstName: createdUser.first_name,
          lastName: createdUser.last_name,
          email: createdUser.email,
          role: createdUser.role,
          organizationId: organizationDetails.id,
          organizationName: organizationDetails.name,
        },
        token: tokens.accessToken,
      };
    } catch (error) {
      this.logger.error("Sign up error", error);
      throw error;
    }
  }

  /**
   * Sign in user
   * @param createUserDto
   * @returns
   */
  @Post("sign-in")
  async signIn(
    @Body() signInDto: SigInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { email, password }: SigInDto = signInDto;
      /**
       * Find user by email
       */
      const findOptions: FindOneOptions<UserEntity> = {
        where: { email },
        select: ["id", "email", "password"],
      };

      const user = await this.usersService.findOne(findOptions);

      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      /**
       * Validate password
       */
      const isPasswordValid: boolean = this.utilService.isPasswordValid(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException(
          ERRORS.USER.INVALID_CREDENTIALS,
          HttpStatus.NOT_FOUND,
        );
      }

      const tokens = await this.authService.generateTokens({
        id: user.id,
        email: user.email,
        organizationId: user.organization.id,
      });

      await this.userTokensService.createToken(user.id, tokens.refreshToken);
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        user: {
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
          organizationId: user.organization.id,
          organizationName: user.organization.name,
        },
        token: tokens.accessToken,
      };
    } catch (error) {
      console.error("[AuthController]:[signIn]:", error);
      throw error;
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  refreshTokens(@Req() req) {
    const userId: string = req.user.id;
    const refreshToken: string = req.user.refreshToken;
    return this.authService.refreshToken(userId, refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AccessTokenGuard)
  @Get("logout")
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    try {
      const refresToken: string = req.user.refreshToken;
      if (!refresToken) {
        throw new HttpException(
          ERRORS.AUTH.INVALID_REFRESH_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.userTokensService.removeTokens(refresToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
      });

      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("[AuthController]:[logout]:", error);
      throw error;
    }
  }
}
