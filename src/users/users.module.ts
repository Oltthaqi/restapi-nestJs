import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MessageModule } from 'src/message/message.module';
import { VerificationModule } from 'src/verification/verification.module';
import { VerificationService } from 'src/verification/verification.service';
import { Verification } from 'src/verification/entities/verification.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { Comment } from 'src/comments/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Verification, Comment]),
    MessageModule,
    VerificationModule,
    CommentsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, VerificationService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
