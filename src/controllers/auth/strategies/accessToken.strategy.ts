import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/controllers/users/users.service';

type JwtPayload = {
  sub: string;
  email: string;
  accountId: string;
  accountType?: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    // private readonly registrationUserService: RegistrationUserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {

    // if (payload.accountType === 'registration') {
    //   const registrationUser = await this.registrationUserService.findOne({
    //     where: {
    //       id: payload.sub,
    //     },
    //   });

    //   if (!registrationUser) {
    //     return false;
    //   }

    //   return {
    //     details: registrationUser,
    //     ...payload,
    //   };
    // }

    const user = await this.userService.findOne({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      return false;
    }

    return {
      details: user,
      ...payload,
    };
  }
}
