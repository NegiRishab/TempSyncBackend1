import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { CardService } from "./card.service";
import {
  AssignCardDto,
  CreateCardDto,
  UpdateCardDto,
} from "./dto/create-card.dto";
import { AccessTokenGuard } from "../auth/guards/accessToken.guard";
import { RedisService } from "src/redis/redis.service";

@Controller("card")
@UseGuards(AccessTokenGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly redisService: RedisService,
  ) {}

  @Post("/create")
  async create(@Body() createCardDto: CreateCardDto, @Req() req) {
    const userId: string = req.user.id;
    await this.cardService.createCard(userId, createCardDto);
    await this.redisService.invalidateWorkplaceUsersCache(
      createCardDto.workplaceId,
    );
    return { message: "Card Created successfully" };
  }

  @Put("/update-card")
  async updateCard(@Body() updateCardDto: UpdateCardDto) {
    const card = await this.cardService.getCard(updateCardDto.cardId);

    if (!card) throw new NotFoundException("Card not found");

    await this.cardService.updateCard(updateCardDto);

    await this.redisService.invalidateWorkplaceUsersCache(card.workplace.id);
    return { message: "Card Updated successfully" };
  }

  @Patch("/assign-user")
  async assignCard(@Body() assignCardDto: AssignCardDto) {
    const card = await this.cardService.getCard(assignCardDto.cardId);

    if (!card) throw new NotFoundException("Card not found");

    await this.cardService.assignCard(
      assignCardDto.cardId,
      assignCardDto.userId,
    );
    await this.redisService.invalidateWorkplaceUsersCache(card.workplace.id);

    return { message: "User Assign to the card successfully" };
  }

  @Delete("/delete/:cardId")
  async deleteCard(@Param("cardId") cardId: string) {
    const card = await this.cardService.getCard(cardId);

    if (!card) throw new NotFoundException("Card not found");
    await this.cardService.deleteCard(cardId);
    await this.redisService.invalidateWorkplaceUsersCache(card.workplace.id);
    return { message: "Card removed successfully" };
  }
}
