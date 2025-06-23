import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
} from "@nestjs/common";
import { CardService } from "./card.service";
import {
  AssignCardDto,
  CreateCardDto,
  UpdateCardDto,
} from "./dto/create-card.dto";

@Controller("card")
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post("/create")
  create(@Body() createCardDto: CreateCardDto, @Req() req) {
    const userId: string = req.user.id;
    return this.cardService.createCard(userId, createCardDto);
  }

  @Put("/update-card")
  updateCard(@Body() updateCardDto: UpdateCardDto) {
    return this.cardService.updateCard(updateCardDto);
  }

  @Patch("/assign-user")
  assignCard(@Body() assignCardDto: AssignCardDto) {
    return this.cardService.assignCard(
      assignCardDto.cardId,
      assignCardDto.userId,
    );
  }

  @Delete("/delete/:cardId")
  deleteCard(@Param("cardID") cardId: string) {
    return this.cardService.deleteCard(cardId);
  }
}
