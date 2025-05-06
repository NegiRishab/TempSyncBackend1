import { Injectable } from "@nestjs/common";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import { Organization } from "./entities/organization.entity";
import { FindOneOptions, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    return await this.organizationRepository
      .create(createOrganizationDto)
      .save();
  }

  findAll() {
    return `This action returns all organization`;
  }

  async findOne(findOptions: FindOneOptions<Organization>) {
    try {
      return await this.organizationRepository.findOne(findOptions);
    } catch (error) {
      console.error("[OrganizationService]:[findOne]:", error);
      throw error;
    }
  }
}
