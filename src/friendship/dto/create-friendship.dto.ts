import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
// import { FriendshipStatus } from '../enum/status.enum';

export class CreateFriendshipDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  addresseeId: number;

  createdAt: Date;

  // status: FriendshipStatus.PENDING;
}
