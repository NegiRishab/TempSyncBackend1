import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { UserTokenService } from "../users/user-token.service";
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
  private async generateAccessToken(user: { id: string; email: string }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
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
  private async generateRefreshToken(user: { id: string; email: string }) {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: `${this.configService.get<number>("JWT_REFRESH_EXPIRES_IN_HOURS")}h`,
      },
    );
  }

  /**
   * Generate access and refresh tokens
   * @param user
   * @returns
   */
  async generateTokens(user: { id: string; email: string }) {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(user),
        this.generateRefreshToken(user),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("[AuthController]:[refreshTokens]:", error);
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
  //     // await this.userTokenService.removeTokens(userId);
  //   } catch (error) {
  //     console.error("[AuthController]:[logout]:", error);
  //     throw error;
  //   }
  // }
}
