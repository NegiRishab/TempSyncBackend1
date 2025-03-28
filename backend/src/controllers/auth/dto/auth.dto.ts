import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsStrongPassword,
} from 'class-validator';
import { ERRORS } from '../../../common/constants/index';
import { VERIFICATION_CODE_TYPES } from 'src/common/enums';

export class SignUpDto {

	@IsNotEmpty({ message: ERRORS.USER.FIRST_NAME_IS_REQUIRED })
	@IsString({ message: ERRORS.USER.FIRST_NAME_IS_INVALID })
	firstName: string;

	@IsNotEmpty({ message: ERRORS.USER.LAST_NAME_IS_REQUIRED })
	@IsString({ message: ERRORS.USER.LAST_NAME_IS_INVALID })
	lastName: string;

	@IsEmail(undefined, { message: ERRORS.USER.EMAIL_IS_INVALID })
	@IsNotEmpty({ message: ERRORS.USER.EMAIL_IS_REQUIRED })
	email: string;

	@IsNotEmpty({ message: ERRORS.USER.PASSWORD_IS_REQUIRED })
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minNumbers: 1,
			minSymbols: 1,
			minUppercase: 1,
		},
		{ message: ERRORS.AUTH.PASSWORD_IS_NOT_STRONG },
	)
	password: string;
}

export class SigInDto {
	@IsEmail(undefined, { message: ERRORS.USER.EMAIL_IS_INVALID })
	@IsNotEmpty({ message: ERRORS.USER.EMAIL_IS_REQUIRED })
	email: string;

	@IsNotEmpty({ message: ERRORS.USER.PASSWORD_IS_REQUIRED })
	password: string;
}

