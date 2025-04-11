import { Injectable } from '@nestjs/common';
import { CreateClinicDto,UpdateClinicDto } from './dto/clinic.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicEntity } from './entities/clinic.entity';

@Injectable()
export class ClinicService {
 constructor(
    @InjectRepository(ClinicEntity)
    private readonly clinicRepository: Repository<ClinicEntity>,
  ) { }

  /**
   * create clinic
   * @param createClinicDto 
   */
 async create(createClinicDto: Partial<CreateClinicDto>) {
   try {
    return await this.clinicRepository.create(createClinicDto).save()
   } catch (error) {
    console.error('[ClinicService]:[create]:', error.message);
      throw error;
   }
  }


  findOne(id: number) {
    return `This action returns a #${id} clinic`;
  }

  update(id: number, updateClinicDto: UpdateClinicDto) {
    return `This action updates a #${id} clinic`;
  }

  remove(id: number) {
    return `This action removes a #${id} clinic`;
  }
}
