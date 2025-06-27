import { IsNotEmpty, IsString, IsOptional, IsUUID } from "class-validator";

export class CreateNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
