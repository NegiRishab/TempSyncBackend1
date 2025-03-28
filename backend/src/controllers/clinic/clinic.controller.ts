import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Logger } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CreateClinicDto, UpdateClinicDto } from './dto/clinic.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@Controller('clinic')
export class ClinicController {

  private readonly logger = new Logger(ClinicController.name);
  constructor(private readonly clinicService: ClinicService) { }

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(@Body() createClinicDto: CreateClinicDto) {
    try {
      return this.clinicService.create(createClinicDto);
    } catch (error) {
      this.logger.error('[ClinicController]:[create]:', error);

      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  findOne(@Param('id') id: string) {
    return this.clinicService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto) {
    return this.clinicService.update(+id, updateClinicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicService.remove(+id);
  }
}
