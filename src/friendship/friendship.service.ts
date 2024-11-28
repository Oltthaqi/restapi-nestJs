import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { UpdateFriendshipDto } from './dto/update-friendship.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Friendship } from './entities/friendship.entity';
import { Repository } from 'typeorm';
import { FriendshipStatus } from './enum/status.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    readonly friendshipRepo: Repository<Friendship>,
    @InjectRepository(User)
    readonly userRepo: Repository<User>,
  ) {}
  async create(requesterId: number, createFriendshipDto: CreateFriendshipDto) {
    const friendshipExists = await this.friendshipRepo.findOne({
      where: {
        requesterId,
        addresseeId: createFriendshipDto.addresseeId,
      },
    });
    if (friendshipExists) {
      if (friendshipExists.status == FriendshipStatus.PENDING) {
        throw new BadRequestException(
          'You already send a friend request to this user ',
        );
      }
      if (friendshipExists.status == FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('you are friends');
      }
    }
    const friendship = await this.friendshipRepo.create({
      ...createFriendshipDto,
      requesterId,
      status: FriendshipStatus.PENDING,
    });

    return await this.friendshipRepo.save(friendship);
  }

  async findAll() {
    //admin
    return await this.friendshipRepo.find();
  }

  async findOne(id: number) {
    return await this.friendshipRepo.findOne({ where: { id } });
  }

  async updateAcceptFriend(
    id: number,
    updateFriendshipDto: UpdateFriendshipDto,
    addresseeId: number,
  ) {
    const friendship = await this.friendshipRepo.findOne({ where: { id } });
    if (friendship.addresseeId !== addresseeId) {
      throw new UnauthorizedException(
        'You cant accept or reject this friend request ',
      );
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      throw new BadRequestException('You already accepted the friend request');
    }

    if (friendship.status === FriendshipStatus.REJECTED) {
      throw new BadRequestException('You already rejected the friend request');
    }
    updateFriendshipDto.status = FriendshipStatus.ACCEPTED;
    Object.assign(friendship, updateFriendshipDto);
    return await this.friendshipRepo.save(friendship);
  }

  async updateRejectFriend(
    id: number,
    updateFriendshipDto: UpdateFriendshipDto,
    addresseeId: number,
  ) {
    const friendship = await this.friendshipRepo.findOne({ where: { id } });
    if (friendship.addresseeId !== addresseeId) {
      throw new UnauthorizedException(
        'You cant accept or reject this friend request ',
      );
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      throw new BadRequestException('You already accepted the friend request');
    }

    if (friendship.status === FriendshipStatus.REJECTED) {
      throw new BadRequestException('You already rejected the friend request');
    }
    updateFriendshipDto.status = FriendshipStatus.REJECTED;

    Object.assign(friendship, updateFriendshipDto);
    return await this.friendshipRepo.save(friendship);
  }

  async getAllPendingPerUser(userId: number) {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('Invalid userId provided');
    }
    const pendingRequests = await this.friendshipRepo.find({
      where: [
        { addresseeId: userId, status: FriendshipStatus.PENDING },
        { requesterId: userId, status: FriendshipStatus.PENDING },
      ],
    });
    return pendingRequests;
  }

  async getAllFriends(userId: number) {
    const friend1 = await this.friendshipRepo.find({
      where: { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
    });

    const friend2 = await this.friendshipRepo.find({
      where: { requesterId: userId, status: FriendshipStatus.ACCEPTED },
    });
    const friends = [...friend1, ...friend2];
    return friends;
  }

  async removeFriend(requesterId: number, userId: number) {
    let friendship = await this.friendshipRepo.findOne({
      where: {
        addresseeId: requesterId,
        requesterId: userId,
        status: FriendshipStatus.ACCEPTED,
      },
    });
    if (!friendship) {
      friendship = await this.friendshipRepo.findOne({
        where: { addresseeId: userId, requesterId },
      });
    }
    if (friendship.status === FriendshipStatus.REJECTED) {
      throw new BadRequestException('you have Rejected this friend reqest');
    }

    if (friendship.status === FriendshipStatus.PENDING) {
      throw new BadRequestException('you have not accepted the friend request');
    }
    return await this.friendshipRepo.remove(friendship);
  }

  async blockUser(userId: number, id: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    const userToBlock = await this.userRepo.findOne({ where: { id } });

    if (!userToBlock) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyBlocked = user.blockedUsers.some(
      (blockedUser) => blockedUser.id === userToBlock.id,
    );

    if (isAlreadyBlocked) {
      throw new BadRequestException('User is already blocked');
    }

    user.blockedUsers.push(userToBlock);
    const friendship = await this.friendshipRepo.findOne({
      where: [
        { addresseeId: id, requesterId: userId },
        { addresseeId: userId, requesterId: id },
      ],
    });

    if (friendship) {
      await this.friendshipRepo.remove(friendship);
    }

    return await this.userRepo.save(user);
  }

  async removeBlock(userId: number, id: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['blockedUsers'],
    });
    const userToUnblock = await this.userRepo.findOne({
      where: { id },
    });
    if (!userToUnblock) {
      throw new NotFoundException('User not found');
    }

    const isAlreadyBlocked = user.blockedUsers.some(
      (blockedUser) => blockedUser.id === userToUnblock.id,
    );
    if (!isAlreadyBlocked) {
      throw new BadRequestException('user is not blocked');
    }
    user.blockedUsers = user.blockedUsers.filter(
      (blockedUser) => blockedUser.id !== userToUnblock.id,
    );

    return await this.userRepo.save(user);
  }
}
