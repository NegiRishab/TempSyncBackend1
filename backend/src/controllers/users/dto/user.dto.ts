import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { ERRORS } from '../../../common/constants/index';

export class InviteUserDto {
  @IsNotEmpty({ message: ERRORS.USER.FIRST_NAME_IS_REQUIRED })
  @IsString({ message: ERRORS.USER.FIRST_NAME_IS_INVALID })
  firstName: string;

  @IsNotEmpty({ message: ERRORS.USER.LAST_NAME_IS_REQUIRED })
  @IsString({ message: ERRORS.USER.LAST_NAME_IS_INVALID })
  lastName: string;

  @IsEmail(undefined, { message: ERRORS.USER.EMAIL_IS_INVALID })
  @IsNotEmpty({ message: ERRORS.USER.EMAIL_IS_REQUIRED })
  email: string;
}

export class InviteAcceptUserDto {
  @IsUUID(undefined, { message: ERRORS.USER.USER_ID_IS_INVALID })
  @IsNotEmpty({ message: ERRORS.USER.USER_ID_IS_REQUIRED })
  id: string;

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

export class UpdateUserDto {
  @IsOptional({ message: ERRORS.USER.FIRST_NAME_IS_INVALID })
  firstName: string;

  @IsOptional({ message: ERRORS.USER.LAST_NAME_IS_INVALID })
  lastName: string;

  @IsOptional({message: ERRORS.USER.LANGUAGE_IS_INVALID})
  language: string;

  @IsOptional({message: ERRORS.USER.USER_ROLE_IS_INVALID})
  role: string;
}

export class UpdateUserPasswordDto {
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
