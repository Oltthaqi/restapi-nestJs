import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/Update-Friendship.dto';
import { Request as ExpressRequest } from 'express';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('friendship')
@UseGuards(RolesGuard)
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(
    @Body() createFriendshipDto: CreateFriendshipDto,
    @Req() req: ExpressRequest,
  ) {
    const user = req.user as User;
    console.log(req.user);

    return this.friendshipService.create(user.id, createFriendshipDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.friendshipService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.friendshipService.findOne(+id);
  }

  @Get('pending/friend-requests-user')
  @Roles(UserRole.ADMIN, UserRole.USER)
  getAllPendingFriends(@Req() req: ExpressRequest) {
    const user = req.user as User;
    console.log('fdfsvdsv', user);

    return this.friendshipService.getAllPendingPerUser(user.id);
  }

  @Get('accepted/friend-requests')
  @Roles(UserRole.ADMIN, UserRole.USER)
  getAllFriends(@Req() req: ExpressRequest) {
    const user = req.user as User;

    return this.friendshipService.getAllFriends(user.id);
  }

  @Patch('Accept-Friend-request/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  updateAcceptFriend(
    @Param('id') id: string,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Req() req: ExpressRequest,
  ) {
    const user = req.user as User;
    return this.friendshipService.updateAcceptFriend(
      +id,
      updateFriendshipDto,
      user.id,
    );
  }

  @Patch('Reject-Friend-request/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  updateRejectFriend(
    @Param('id') id: string,
    @Body() updateFriendshipDto: UpdateFriendshipDto,
    @Req() req: ExpressRequest,
  ) {
    console.log(id);

    const user = req.user as User;
    console.log(user);

    return this.friendshipService.updateRejectFriend(
      +id,
      updateFriendshipDto,
      user.id,
    );
  }

  @Delete('remove-friend/:id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  removeFriend(@Param('id') id: number, @Req() req: ExpressRequest) {
    const user = req.user as User;
    return this.friendshipService.removeFriend(+id, user.id);
  }

  @Post('block-User/:userToBLockId')
  @Roles(UserRole.ADMIN, UserRole.USER)
  blockUser(
    @Param('userToBLockId') userToBLockId: number,
    @Req() req: ExpressRequest,
  ) {
    const user = req.user as User;

    return this.friendshipService.blockUser(user.id, +userToBLockId);
  }

  @Post('unblock-user/:userToUnblock')
  @Roles(UserRole.ADMIN, UserRole.USER)
  unblockUser(
    @Param('userToUnblock') userToUnblock: number,
    @Req() req: ExpressRequest,
  ) {
    const user = req.user as User;
    return this.friendshipService.removeBlock(user.id, +userToUnblock);
  }
}
