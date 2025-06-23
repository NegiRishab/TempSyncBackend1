import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkplaceDto } from './create-workplace.dto';

export class UpdateWorkplaceDto extends PartialType(CreateWorkplaceDto) {}
