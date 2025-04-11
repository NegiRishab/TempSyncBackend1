
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { ERRORS } from 'src/common/constants';


export class CreateClinicDto {
  @IsNotEmpty({ message: ERRORS.CLINIC.NAME_IS_REQUIRED })
  @IsString({ message: ERRORS.CLINIC.NAME_IS_INVALID })
  name: string;

  @IsNotEmpty({ message: ERRORS.CLINIC.ADDRESS_IS_REQUIRED })
  @IsString({ message: ERRORS.CLINIC.ADDRESS_IS_INVALID })
  address: string;

  @IsEmail(undefined, { message: ERRORS.CLINIC.EMAIL_IS_INVALID })
  @IsNotEmpty({ message: ERRORS.CLINIC.EMAIL_IS_REQUIRED })
  email: string;

  @IsOptional()
  @IsString({ message: ERRORS.CLINIC.PHONE_IS_INVALID })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: ERRORS.CLINIC.LATITUDE_IS_INVALID })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: ERRORS.CLINIC.LONGITUDE_IS_INVALID })
  longitude?: number;
}



export class UpdateClinicDto {
  @IsOptional()
  @IsString({ message: ERRORS.CLINIC.NAME_IS_INVALID })
  name?: string;

  @IsOptional()
  @IsString({ message: ERRORS.CLINIC.ADDRESS_IS_INVALID })
  address?: string;

  @IsOptional()
  @IsString({ message: ERRORS.CLINIC.PHONE_IS_INVALID })
  phone?: string;

  @IsOptional()
  @IsNumber({}, { message: ERRORS.CLINIC.LATITUDE_IS_INVALID })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: ERRORS.CLINIC.LONGITUDE_IS_INVALID })
  longitude?: number;
}
