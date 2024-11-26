import { PartialType } from '@nestjs/swagger';
import { CreateCategoireDto } from './create-categoire.dto';

export class UpdateCategoireDto extends PartialType(CreateCategoireDto) {}
