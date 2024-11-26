import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { VerificationService } from './verification.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Verification, User])],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
