import { IsOptional } from "class-validator";

export class UpdateOrganizationDto {
  @IsOptional()
  name: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;
}
