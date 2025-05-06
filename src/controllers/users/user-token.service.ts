import { Injectable } from "@nestjs/common";
import { UserTokensEntity } from "./entities/userTokens.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, Repository } from "typeorm";

@Injectable()
export class UserTokenService {
  constructor(
    @InjectRepository(UserTokensEntity)
    private readonly userTokenRepository: Repository<UserTokensEntity>,
  ) {}

  /**
   * Create user
   * @param createUserDto
   * @returns
   */
  async createToken(userId: string, refreshToken: string) {
    try {
      const tokenEntity = this.userTokenRepository.create({
        token: refreshToken,
        user: { id: userId },
      });

      return await this.userTokenRepository.save(tokenEntity);
    } catch (error) {
      console.error("[UserTokenService]:[createToken]:", error);
      throw error;
    }
  }

  /**
   * Find one user
   * @param findOptions
   * @returns
   */
  async findOne(findOptions: FindOneOptions) {
    try {
      return await this.userTokenRepository.findOne(findOptions);
    } catch (error) {
      console.error("[UserTokenService]:[findOne]:", error);
      throw error;
    }
  }

  /**
   * Find one user
   * @param userId
   * @param updatePayload
   * @returns
   */
  // async saveTokens(userId: string, updatePayload: { refreshToken: string }) {
  //   try {
  //     const userToken = await this.userTokenRepository.findOne({
  //       where: {
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     });

  //     if (!userToken) {
  //       return await this.create({
  //         token: updatePayload.token,
  //         refreshToken: updatePayload.token,
  //         userId,
  //       });
  //     }

  //     userToken.token = updatePayload.token;
  //     userToken.refreshToken = updatePayload.refreshToken;

  //     return await userToken.save();
  //   } catch (error) {
  //     console.error("[UserTokenService]:[saveTokens]:", error);
  //     throw error;
  //   }
  // }

  /**
   * Find one user and remove tokens
   * @param userId
   * @returns
   */
  // async removeTokens(userId: string) {
  //   try {
  //     const userToken = await this.userTokenRepository.findOne({
  //       where: {
  //         user: {
  //           id: userId,
  //         },
  //       },
  //     });

  //     if (!userToken) {
  //       return true;
  //     }

  //     userToken.token = "";
  //     userToken.refreshToken = "";

  //     await userToken.save();
  //     return true;
  //   } catch (error) {
  //     console.error("[UserTokenService]:[removeTokens]:", error);
  //     throw error;
  //   }
  // }
}
