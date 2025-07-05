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
import { SigInDto, SignUpDto, SignUpFromInviteDto } from "./dto/auth.dto";
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
import { Request, Response } from "express";
import { AccessTokenGuard } from "./guards/accessToken.guard";
import { InvitationsService } from "src/invitations/invitations.service";
import axios from "axios";
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
    private readonly invitationsService: InvitationsService,
  ) {}

  /**
   * Create new account and user
   * @param createUserDto
   * @returns
   */
  @HttpCode(HttpStatus.CREATED)
  @Post("sign-up")
  async signUp(@Body() createUserDto: SignUpDto) {
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

      await this.usersService.create(createUserPayload);

      return { message: "User created succesfully" };
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
        relations: ["organization"],
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
        secure: true,
        sameSite: "none",
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

  // src/auth/auth.controller.ts

  @HttpCode(HttpStatus.CREATED)
  @Post("sign-up-from-invite")
  async signUpFromInvite(@Body() dto: SignUpFromInviteDto) {
    try {
      const invitation = await this.invitationsService.validateToken(dto.token);
      if (!invitation) {
        throw new HttpException(
          ERRORS.USER.INVALID_OR_EXPIRED_INVITATION,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingUser = await this.usersService.findOne({
        where: { email: invitation.email.toLowerCase() },
      });

      if (existingUser) {
        throw new HttpException(
          ERRORS.USER.USER_WITH_SAME_EMAIL_EXISTS,
          HttpStatus.BAD_REQUEST,
        );
      }

      const createUserPayload = {
        first_name: dto.firstName,
        last_name: dto.lastName,
        email: invitation.email.toLowerCase(),
        password: this.utilService.encodePassword(dto.password),
        role: UserRoleEnum.member,
        organization: invitation.organization,
      };

      const User: UserEntity =
        await this.usersService.create(createUserPayload);

      await this.invitationsService.markAsUsed(dto.token);

      await axios.post(
        `${this.configService.get("CHAT_SERVICE_URL")}/api/conversations/add-new-user-global`,
        {
          userId: User.id,
          orgId: invitation.organization.id,
        },
      );

      return { message: "User created successfully from invitation" };
    } catch (error) {
      this.logger.error("Sign up from invitation error", error);
      throw error;
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  refreshTokens(@Req() req) {
    const userId: string = req.user.details.id;
    const refreshToken: string = req.user.refreshToken;
    return this.authService.refreshToken(userId, refreshToken);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get("check")
  verify() {
    try {
      return { message: "User is authenticated succesfully" };
    } catch (error) {
      console.error("[AuthController]:[logout]:", error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refresToken: string = req.cookies?.refreshToken;
      if (!refresToken) {
        throw new HttpException(
          ERRORS.AUTH.INVALID_REFRESH_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.userTokensService.removeTokens(refresToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return { message: "User logout succesfully" };
    } catch (error) {
      console.error("[AuthController]:[logout]:", error);
      throw error;
    }
  }
}
