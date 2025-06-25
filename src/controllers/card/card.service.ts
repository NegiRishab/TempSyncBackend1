import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Organization } from "../organization/entities/organization.entity";
import { WorkplaceUser } from "../workplace/entities/workplace-user.entity";
import { UserEntity } from "../users/entities/user.entity";
import { Workplace } from "../workplace/entities/workplace.entity";
import { ERRORS } from "src/common/constants";
import { Card } from "./entities/card.entity";
import { UpdateCardDto } from "./dto/create-card.dto";

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepo: Repository<Card>,

    @InjectRepository(Workplace)
    private workplaceRepo: Repository<Workplace>,

    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(WorkplaceUser)
    private wpUserRepo: Repository<WorkplaceUser>,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async createCard(
    userId: string,
    dto: { title: string; description?: string; workplaceId: string },
  ) {
    try {
      const workplace = await this.workplaceRepo.findOne({
        where: { id: dto.workplaceId },
      });

      if (!workplace) throw new NotFoundException("Workplace not found");

      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const card = this.cardRepo.create({
        title: dto.title,
        description: dto.description,
        workplace,
        createdBy: user,
      });

      return await this.cardRepo.save(card);
    } catch (error) {
      console.error("[cardService]:[updateStatus]:", error);
      throw error;
    }
  }

  async updateCard(cardUpdate: UpdateCardDto) {
    try {
      const card = await this.cardRepo.findOne({
        where: { id: cardUpdate.cardId },
      });

      if (!card) throw new NotFoundException("Card not found");

      card.description = cardUpdate.description
        ? cardUpdate.description
        : card.description;
      card.title = cardUpdate.title ? cardUpdate.title : card.title;
      card.status = cardUpdate.status ? cardUpdate.status : card.status;

      return await this.cardRepo.save(card);
    } catch (error) {
      console.error("[cardService]:[updateStatus]:", error);
      throw error;
    }
  }

  async assignCard(cardId: string, userId: string) {
    try {
      const card = await this.cardRepo.findOne({
        where: { id: cardId },
        relations: ["workplace"],
      });
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!card || !user) throw new NotFoundException("Card or user not found");

      // Check if user is part of workplace
      const wpMembership = await this.wpUserRepo.findOne({
        where: {
          workplace: { id: card.workplace.id },
          user: { id: userId },
        },
      });

      if (!wpMembership)
        throw new BadRequestException("User is not in this workplace");

      card.assignee = user;
      return await this.cardRepo.save(card);
    } catch (error) {
      console.error("[cardService]:[updateStatus]:", error);
      throw error;
    }
  }

  async deleteCard(cardId: string) {
    try {
      const card = await this.cardRepo.findOne({ where: { id: cardId } });
      if (!card) throw new NotFoundException("Card not found");

      await this.cardRepo.remove(card);
      return { message: "Card deleted" };
    } catch (error) {
      console.error("[cardService]:[deleteCard]:", error);
      throw error;
    }
  }
}
