import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateWorkplaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddUserToWorkplaceDto {
  @IsUUID()
  userId: string;
}
