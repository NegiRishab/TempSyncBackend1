import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/controllers/users/users.service";
import { JwtPayload } from "src/common/types/index.type";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request): string | null => {
        return req?.cookies?.refreshToken || null;
      },
      secretOrKey: configService.get<string>("JWT_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.refreshToken;
    const user = await this.userService.findOne({
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      return null;
    }

    return {
      ...payload,
      details: user,
      refreshToken,
    };
  }
}
