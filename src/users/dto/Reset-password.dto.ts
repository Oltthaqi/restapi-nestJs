import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ReesetPassowrdDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
