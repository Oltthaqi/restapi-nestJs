import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { FriendshipStatus } from '../enum/status.enum';

export class UpdateFriendshipDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  requesterId: number;

  status: FriendshipStatus;

  updatedAt: Date;
}
