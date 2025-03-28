import {
	Controller,
	Post,
	Body,
	HttpException,
	HttpStatus,
	HttpCode,
	Req,
	UseGuards,
	Get,
} from '@nestjs/common';
import * as moment from 'moment';
import { UsersService } from '../../controllers/users/users.service';
import {
	SignUpDto,
	SigInDto,
} from './dto/auth.dto';
import { ERRORS, SUCCESS_MESSAGE } from 'src/common/constants';
import { UtilitiesServices } from 'src/common/services/utils.services';
import { FindOneOptions } from 'typeorm';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { UserTokenService } from '../users/user-token.service';
import { LogEventEnum } from 'src/common/enums/log.enum';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly usersService: UsersService,
		private readonly userTokensService: UserTokenService,
		private readonly utilService: UtilitiesServices,
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) { }

	/**
	 * Create new account and user
	 * @param createUserDto
	 * @returns
	 */
	@HttpCode(HttpStatus.CREATED)
	@Post('sign-up')
	async signUp(@Body() createUserDto: SignUpDto) {
		try {
		
			// check if user with same email or username exists
			const user = await this.usersService.findOne({
				where: {
					email: createUserDto.email.toLocaleLowerCase(),
				},
			});

			if (user && user.email === createUserDto.email) {
				throw new HttpException(
					ERRORS.USER.USER_WITH_SAME_EMAIL_EXISTS,
					HttpStatus.BAD_REQUEST,
				);
			}
			const createUserPayload = {
				firstName: createUserDto.firstName,
				lastName: createUserDto.lastName,
				email: createUserDto.email.toLocaleLowerCase(),
				password: this.utilService.encodePassword(createUserDto.password),
			};
			console.log({createUserPayload})

			// create new user
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...createdUser } =
				await this.usersService.create(createUserPayload);
			return createdUser;
		} catch (error) {
			console.error('[AuthController]:[signUp]:', error);
			
			throw error;
		}
	}

	/**
	 * Sign in user
	 * @param createUserDto
	 * @returns
	 */
	@Post('sign-in')
	async signIn(@Body() signInDto: SigInDto) {
		try {
			const { email, password }: SigInDto = signInDto;
			/**
			 * Find user by email
			 */
			const findOptions: FindOneOptions = {
				where: { email },
				select: ['id', 'email', 'password', 'email'],
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
			});

			await this.userTokensService.saveTokens(user.id, {
				token: tokens.accessToken,
				refreshToken: tokens.refreshToken,
			});

			return tokens;
		} catch (error) {
			console.error('[AuthController]:[signIn]:', error);
			throw error;
		}
	}

	/**
	 * Get user profile
	 * @param req
	 * @returns
	 */
	@Get()
	@UseGuards(AccessTokenGuard)
	async fetchMe(@Req() req) {
		try {
			return req.user;
		} catch (error) {
			console.error('[AuthController]:[fetchMe]:', error);
			throw error;
		}
	}

	@HttpCode(HttpStatus.NO_CONTENT)
	@UseGuards(AccessTokenGuard)
	@Get('logout')
	async logout(@Req() req) {
		try {
			const userId = req.user.sub;
			await this.authService.logout(userId);
		} catch (error) {
			console.error('[AuthController]:[logout]:', error);
			throw error;
		}
	}
}
