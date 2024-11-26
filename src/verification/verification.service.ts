import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Verification } from './entities/verification.entity';
import { generateOtp } from './utils/otp.util';
import { generateOtpPassword } from './utils/otpPassword.util';
import { User } from 'src/users/entities/user.entity';
import { NotFoundError } from 'rxjs';
import { VerificationType } from './enums/types.enum';

@Injectable()
export class VerificationService {
  private readonly minRequestIntervalMinutes = 1;
  private readonly tokenExpirationMinutes = 15;
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(Verification)
    private tokenRepository: Repository<Verification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async generateOtp(userId: number, size = 6): Promise<string> {
    const now = new Date();
    const type = VerificationType.VERIFICATION;
    if (!userId) {
      throw new NotFoundError('user not found');
    }

    const recentToken = await this.tokenRepository.findOne({
      where: {
        userId,
        type,
        createdAt: MoreThan(
          new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
        ),
      },
    });

    if (recentToken) {
      throw new UnprocessableEntityException(
        'Please wait a minute before requesting a new token.',
      );
    }

    const otp = generateOtp(size);

    const tokenEntity = this.tokenRepository.create({
      userId,
      token: otp,
      expiresAt: new Date(
        now.getTime() + this.tokenExpirationMinutes * 60 * 1000,
      ),
      type,
    });

    await this.tokenRepository.delete({ userId });

    await this.tokenRepository.save(tokenEntity);

    return otp;
  }

  async validateOtp(
    userId: number,
    token: string,
    type: VerificationType,
  ): Promise<boolean> {
    const validToken = await this.tokenRepository.findOne({
      where: { userId, expiresAt: MoreThan(new Date()), type },
    });

    if (validToken && token) {
      await this.tokenRepository.remove(validToken);
      return true;
    } else {
      return false;
    }
  }

  async generateOTPPassword(email: string, size = 8): Promise<string> {
    const now = new Date();
    const type = VerificationType.RESETPASSWORD;
    if (!email) {
      throw new Error('user not found');
    }

    const user = await this.userRepository.findOne({ where: { email: email } });

    const userId = user.id;
    const recentToken = await this.tokenRepository.findOne({
      where: {
        userId,
        type,
        createdAt: MoreThan(
          new Date(now.getTime() - this.minRequestIntervalMinutes * 60 * 1000),
        ),
      },
    });

    if (recentToken) {
      throw new UnprocessableEntityException(
        'Please wait a minute before requesting a new token.',
      );
    }

    const otp = generateOtpPassword(size);

    const tokenEntity = this.tokenRepository.create({
      userId,
      token: otp,
      expiresAt: new Date(
        now.getTime() + this.tokenExpirationMinutes * 60 * 1000,
      ),
      type,
    });

    await this.tokenRepository.delete({ userId });

    await this.tokenRepository.save(tokenEntity);

    return otp;
  }

  async cleanUpExpiredTokens() {
    const tokensdb = await this.tokenRepository.find({
      where: { expiresAt: MoreThan(new Date()) },
    });
    return this.tokenRepository.remove(tokensdb);
  }
}
