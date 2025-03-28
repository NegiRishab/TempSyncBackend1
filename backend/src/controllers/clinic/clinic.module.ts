import { Module } from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { ClinicController } from './clinic.controller';
import { UtilsModule } from 'src/common/services/utils.module';
import { ClinicEntity } from './entities/clinic.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[
    TypeOrmModule.forFeature([
          ClinicEntity
        ]),
        UtilsModule,
  ],
  controllers: [ClinicController],
  providers: [ClinicService],
  exports: [ClinicService],
})
export class ClinicModule {}
