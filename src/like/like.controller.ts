import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { User } from 'src/users/entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateLikeDto } from './dto/create-like.dto';

@ApiBearerAuth('access-token')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':universalId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  create(
    @Body() createLikeDto: CreateLikeDto,
    @Req() req: ExpressRequest,
    @Param('universalId') universalId: number,
  ) {
    const user = req.user as User;
    return this.likeService.likePost(createLikeDto, +universalId, user.id);
  }

  @Post('comments/:universalId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  createLikeComment(
    @Body() createLikeDto: CreateLikeDto,
    @Req() req: ExpressRequest,
    @Param('universalId') universalId: number,
  ) {
    const user = req.user as User;
    return this.likeService.likeComment(createLikeDto, +universalId, user.id);
  }

  @Get('likes/:universalId/:universalType')
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  getLikes(
    @Param('universalId') universalId: number,
    @Param('universalType') universalType: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.likeService.getLikes(universalId, universalType, page, limit);
  }
}
