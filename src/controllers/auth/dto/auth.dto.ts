import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from "class-validator";
import { ERRORS } from "../../../common/constants/index";

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

  @IsNotEmpty({ message: ERRORS.USER.ORGANIZATION_NAME_IS_REQUIRED })
  @IsString({ message: ERRORS.USER.ORGANIZATION_NAME_IS_INVALID })
  organizationName: string;

  @IsString({ message: ERRORS.USER.PHONE_IS_INVALID })
  phone: string;

  @IsNotEmpty({ message: ERRORS.USER.ADDRESS_IS_REQUIRED })
  @IsString({ message: ERRORS.USER.ADDRESS_IS_INVALID })
  address: string;
}

export class SigInDto {
  @IsEmail(undefined, { message: ERRORS.USER.EMAIL_IS_INVALID })
  @IsNotEmpty({ message: ERRORS.USER.EMAIL_IS_REQUIRED })
  email: string;

  @IsNotEmpty({ message: ERRORS.USER.PASSWORD_IS_REQUIRED })
  password: string;
}
