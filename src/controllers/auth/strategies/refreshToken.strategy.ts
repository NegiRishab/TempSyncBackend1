import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/controllers/users/users.service";

type JwtPayload = {
  sub: string;
  email: string;
  accountId: string;
};

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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("JWT_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = "hello";
    // const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    const user = await this.userService.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return false;
    }

    return { ...payload, details: user, refreshToken };
  }
}
