import { IsString, IsOptional, IsUUID, Length } from "class-validator";
import { CardStatus } from "src/common/enums";

export class CreateCardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  workplaceId: string;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsUUID()
  cardId: string;

  @IsOptional()
  @IsString()
  status: CardStatus;
}

export class AssignCardDto {
  @IsUUID()
  cardId: string;

  @IsUUID()
  userId: string;
}
