import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoireDto {
  @IsString()
  @ApiProperty()
  name: string;
}
