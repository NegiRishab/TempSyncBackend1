// dto/create-invitation.dto.ts
import { IsEmail, IsUUID } from "class-validator";

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsUUID()
  organizationId: string;
}
