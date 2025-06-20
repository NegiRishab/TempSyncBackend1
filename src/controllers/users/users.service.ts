import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Create user
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: Partial<UserEntity>) {
    try {
      return await this.userRepository.create(createUserDto).save();
    } catch (error) {
      console.error("[UsersService]:[create]:", error);
      throw error;
    }
  }

  /**
   * Find one user
   * @param findOptions
   * @returns
   */
  async findOne(findOptions: FindOneOptions<UserEntity>) {
    try {
      return await this.userRepository.findOne(findOptions);
    } catch (error) {
      console.error("[UsersService]:[findOne]:", error);
      throw error;
    }
  }

  /**
   * To get List Of Users
   * @param findOptions
   * @returns
   */
  async find(findOptions: FindManyOptions<UserEntity>) {
    try {
      const [items, total] =
        await this.userRepository.findAndCount(findOptions);
      return {
        items,
        total,
      };
    } catch (error) {
      console.error("[UsersService]:[find]:", error);
      throw error;
    }
  }

  async findOneAndUpdate(id: string, updateData: Partial<UserEntity>) {
    try {
      return await this.userRepository.update(id, updateData);
    } catch (error) {
      console.error("[UsersService]:[findOneAndUpdate]:", error);
      throw error;
    }
  }
}
