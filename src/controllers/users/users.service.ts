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

// const usersToUpdate = [
//   { id: 1, name: 'Alice', email: 'alice@example.com' },
//   { id: 2, name: 'Bob', email: 'bob@example.com' },
//   { id: 3, name: 'Charlie', email: 'charlie@example.com' }
// ];

// const ids = usersToUpdate.map(user => user.id).join(", ");

// const nameCases = usersToUpdate
//   .map(user => `WHEN id = ${user.id} THEN '${user.name}'`)
//   .join(" ");
// const emailCases = usersToUpdate
//   .map(user => `WHEN id = ${user.id} THEN '${user.email}'`)
//   .join(" ");

// const query = `
//   UPDATE users
//   SET
//     name = CASE ${nameCases} END,
//     email = CASE ${emailCases} END
//   WHERE id IN (${ids});
// `;

// await this.userRepository.query(query);
