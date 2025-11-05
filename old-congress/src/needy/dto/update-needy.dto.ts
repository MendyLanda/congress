import { PartialType } from '@nestjs/mapped-types';
import { CreateNeedyDto } from './create-needy.dto';

export class UpdateNeedyDto extends PartialType(CreateNeedyDto) { }
