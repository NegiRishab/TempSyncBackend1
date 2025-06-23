import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workplace } from "./entities/workplace.entity";
import { Repository } from "typeorm";
import { Organization } from "../organization/entities/organization.entity";
import { WorkplaceUser } from "../workplace-user/entities/workplace-user.entity";
import { UserEntity } from "../users/entities/user.entity";
import { ERRORS } from "src/common/constants";

@Injectable()
export class WorkplaceService {
  constructor(
    @InjectRepository(Workplace)
    private workplaceRepo: Repository<Workplace>,

    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(WorkplaceUser)
    private wpUserRepo: Repository<WorkplaceUser>,

    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async createWorkplace(wplaceName: string, orgId: string, userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          ERRORS.USER.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const org = await this.orgRepo.findOne({
        where: { id: orgId },
        relations: ["users"],
      });

      if (!org) throw new NotFoundException("Organization not found");

      const wp = this.workplaceRepo.create({
        name: wplaceName,
        organization: org,
      });
      await this.workplaceRepo.save(wp);

      // Auto-adding owner as member
      const wpUser = this.wpUserRepo.create({
        workplace: wp,
        user: user,
        isOwner: true,
      });
      await this.wpUserRepo.save(wpUser);

      return wp;
    } catch (error) {
      console.error("[workPlaceService]:[createWorkplace]:", error);
      throw error;
    }
  }

  async addUser(workplaceId: string, userId: string) {
    try {
      const wp = await this.workplaceRepo.findOne({
        where: { id: workplaceId },
        relations: ["organization"],
      });

      if (!wp) throw new NotFoundException("Workplace not found");

      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) throw new NotFoundException("User not found");

      const existing = await this.wpUserRepo.findOne({
        where: { user: { id: userId }, workplace: { id: workplaceId } },
      });

      if (existing) return existing; // Already a member

      const wpUser = this.wpUserRepo.create({
        workplace: wp,
        user: user,
      });
      return this.wpUserRepo.save(wpUser);
    } catch (error) {
      console.error("[workPlaceService]:[addUser]:", error);
      throw error;
    }
  }

  async removeUserFromWorkplace(workplaceId: string, userId: string) {
    try {
      const wpUser = await this.wpUserRepo.findOne({
        where: {
          workplace: { id: workplaceId },
          user: { id: userId },
        },
      });

      if (!wpUser) {
        throw new NotFoundException("User is not part of this workplace.");
      }

      await this.wpUserRepo.remove(wpUser);
      return { message: "User removed from workplace." };
    } catch (error) {
      console.error("[workPlaceService]:[removeUserFromWorkplace]:", error);
      throw error;
    }
  }

  async getMyWorkplacesByUserId(userId: string) {
    try {
      const wpUsers = await this.wpUserRepo.find({
        where: { user: { id: userId } },
        relations: ["workplace", "workplace.cards"],
      });

      return wpUsers.map((wpUser) => wpUser.workplace);
    } catch (error) {
      console.error("[workPlaceService]:[getMyWorkplacesByUserId]:", error);
      throw error;
    }
  }
}
