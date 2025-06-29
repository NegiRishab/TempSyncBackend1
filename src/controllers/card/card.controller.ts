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
import { NotificationsService } from "../notifications/notifications.service";

@Controller("card")
@UseGuards(AccessTokenGuard)
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly redisService: RedisService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post("/create")
  async create(@Body() createCardDto: CreateCardDto, @Req() req) {
    const userId: string = req.user.id;

    const card = await this.cardService.createCard(userId, createCardDto);

    await this.redisService.invalidateWorkplaceUsersCache(
      createCardDto.workplaceId,
    );

    const workplaceUsers = await this.cardService.getAllWorkplaceUsers(
      card.workplace.id,
    );

    // Filter out the user who created the card
    const recipients = workplaceUsers.filter(
      (member) => member.user.id !== userId,
    );

    await Promise.all(
      recipients.map(async (member) => {
        await this.notificationsService.create({
          userId: member.user.id,
          type: "card_create",
          message: `Card "${card.title}" was created in ${card.workplace.name}.`,
          metadata: {
            cardId: card.id,
            updatedBy: userId,
          },
        });
      }),
    );

    return { message: "Card Created successfully" };
  }

  @Put("/update-card")
  async updateCard(@Body() updateCardDto: UpdateCardDto, @Req() req) {
    try {
      const userId: string = req.user.id;
      const cardDetails = await this.cardService.getCard(updateCardDto.cardId);

      if (!cardDetails) throw new NotFoundException("Card not found");

      const card = await this.cardService.updateCard(updateCardDto);

      await this.redisService.invalidateWorkplaceUsersCache(
        cardDetails.workplace.id,
      );

      const workplaceUsers = await this.cardService.getAllWorkplaceUsers(
        cardDetails.workplace.id,
      );

      // Filter out the user who created the card
      const recipients = workplaceUsers.filter(
        (member) => member.user.id !== userId,
      );
      await Promise.all(
        recipients.map(async (member) => {
          await this.notificationsService.create({
            userId: member.user.id,
            type: "card_update",
            message: `Card "${card.title}" was updated in ${cardDetails.workplace.name}.`,
            metadata: {
              cardId: card.id,
              updatedBy: userId,
            },
          });
        }),
      );

      return { message: "Card Updated successfully" };
    } catch (error) {
      console.error("[cardController]:[updateCard]:", error);
      throw error;
    }
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
  async deleteCard(@Param("cardId") cardId: string, @Req() req) {
    const userId: string = req.user.id;
    const card = await this.cardService.getCard(cardId);

    if (!card) throw new NotFoundException("Card not found");
    await this.cardService.deleteCard(cardId);
    await this.redisService.invalidateWorkplaceUsersCache(card.workplace.id);

    const workplaceUsers = await this.cardService.getAllWorkplaceUsers(
      card.workplace.id,
    );

    // Filter out the user who created the card
    const recipients = workplaceUsers.filter(
      (member) => member.user.id !== userId,
    );

    await Promise.all(
      recipients.map(async (member) => {
        await this.notificationsService.create({
          userId: member.user.id,
          type: "card_deleted",
          message: `Card "${card.title}" was removed in ${card.workplace.name}.`,
          metadata: {
            cardId: card.id,
            updatedBy: userId,
          },
        });
      }),
    );
    return { message: "Card removed successfully" };
  }
}
