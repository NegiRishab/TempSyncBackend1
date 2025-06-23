import { Module } from '@nestjs/common';
import { WorkplaceService } from './workplace.service';
import { WorkplaceController } from './workplace.controller';

@Module({
  controllers: [WorkplaceController],
  providers: [WorkplaceService],
})
export class WorkplaceModule {}
