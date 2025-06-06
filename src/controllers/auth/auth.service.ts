import { JwtService } from "@nestjs/jwt";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { UserTokenService } from "../users/user-token.service";
import { JwtPayload } from "src/common/types/index.type";
import { ERRORS } from "src/common/constants";
// import { ERRORS } from "src/common/constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly userTokenService: UserTokenService,
  ) {}

  /**
   * Generate new access token
   * @param user
   * @returns
   */
  private async generateAccessToken(user: JwtPayload) {
    return this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: `${this.configService.get<number>("JWT_EXPIRES_IN_HOURS")}h`,
      },
    );
  }

  /**
   * Generate new refresh token
   * @param user
   * @returns
   */
  private async generateRefreshToken(user: JwtPayload) {
    return this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
      },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: `${this.configService.get<number>("JWT_REFRESH_EXPIRES_IN_DAYS")}d`,
      },
    );
  }

  /**
   * Generate access and refresh tokens
   * @param user
   * @returns
   */
  async generateTokens(user: JwtPayload) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("[AuthService]:[generateTokens]:", error);
      throw error;
    }
  }

  async refreshToken(userId: string, token: string) {
    try {
      const UserSession = await this.userTokenService.findOne({
        where: { token, is_revoked: false },
      });

      if (!UserSession) {
        throw new HttpException(
          ERRORS.AUTH.INVALID_REFRESH_TOKEN,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findOne({
        where: { id: userId },
        relations: ["organization"],
      });

      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const userDetailsForToken: JwtPayload = {
        id: user.id,
        email: user.email,
        organizationId: user.organization.id,
      };

      const [accessToken] = await Promise.all([
        this.generateAccessToken(userDetailsForToken),
      ]);

      return { accessToken };
    } catch (error) {
      console.error("[AuthService]:[refreshTokens]:", error);
      throw error;
    }
  }

  /**
   * Remove user tokens for logout
   * @param userId
   * @returns
   */
  // async logout(userId: string) {
  //   try {
  //     await this.userTokenService.removeTokens(userId);
  //   } catch (error) {
  //     console.error("[AuthController]:[logout]:", error);
  //     throw error;
  //   }
  // }
}
