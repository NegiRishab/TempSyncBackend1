import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkplaceUserDto } from './create-workplace-user.dto';

export class UpdateWorkplaceUserDto extends PartialType(CreateWorkplaceUserDto) {}
