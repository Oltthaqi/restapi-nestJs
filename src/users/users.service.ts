import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/auth/enums/user-role.enum';
import { EmailService } from 'src/message/email.service';
import { VerificationService } from 'src/verification/verification.service';
import { Verification } from 'src/verification/entities/verification.entity';
import { accountStatus } from './enums/account-status.enum';
import { VerificationType } from 'src/verification/enums/types.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService,
    private verificationTokenService: VerificationService,
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (userExists) {
      throw new HttpException('User already exists.', HttpStatus.CONFLICT);
    }
    if (
      createUserDto.role !== UserRole.ADMIN ||
      createUserDto.role !== UserRole.ADMIN
    ) {
      throw new HttpException(
        'Role dosnt match the roles.',
        HttpStatus.CONFLICT,
      );
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    page: number;
    totalRecords: number;
    totalPages: number;
    data: User[];
  }> {
    if (!page || page === 0) {
      page = 1;
    }
    if (!limit || limit === 0) {
      limit = 10;
    }
    const skip = (+page - 1) * +limit;
    const [data, totalRecords] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      page,
      totalRecords,
      totalPages,
      data,
    };
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const userToDelete = await this.userRepository.findOne({ where: { id } });
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(userToDelete);
  }

  async generateEmailVerification(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const otp = await this.verificationTokenService.generateOtp(user.id);

    this.emailService.sendEmail({
      subject: 'MyApp - Account Verification',
      recipients: [{ name: user.username ?? '', address: user.username }],
      html: `<p>Hi ${user.username} ,</p><p>You may verify your MyApp account using the following OTP: <br /><span style="font-size:24px; font-weight: 700;">${otp}</span></p><p>Regards,<br />MyApp</p>`,
    });
  }

  async verifyEmail(token: string) {
    const invalidMessage = 'Invalid or expired OTP';
    const type = VerificationType.VERIFICATION;
    const verificationId = await this.verificationRepository.findOne({
      where: { token: token },
    });

    const user = await this.userRepository.findOne({
      where: { id: verificationId.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (user.emailVerifiedAt) {
      throw new UnprocessableEntityException('Account already verified');
    }

    const isValid = await this.verificationTokenService.validateOtp(
      user.id,
      token,
      type,
    );

    if (!isValid) {
      throw new UnprocessableEntityException(invalidMessage);
    }

    user.emailVerifiedAt = new Date();
    user.accountStatus = accountStatus.ACTIVE;
    user.isVerified = true;

    await this.userRepository.save(user);

    return true;
  }
  async generateEmailResetPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(user);

    const otp = await this.verificationTokenService.generateOTPPassword(
      user.email,
    );

    this.emailService.sendEmail({
      subject: 'MyApp - Reset Password',
      recipients: [{ name: user.username ?? '', address: user.username }],
      html: `<p>Hi ${user.username} ,</p><p>Reset your password using the following OTP: <br /><span style="font-size:24px; font-weight: 700;">${otp}</span></p><p>Regards,<br />MyApp</p>`,
    });
  }

  async resetPassword(token: string, password: string) {
    const verificationId = await this.verificationRepository.findOne({
      where: { token: token },
    });
    const type = VerificationType.RESETPASSWORD;
    if (!verificationId) {
      throw new NotFoundException('Invalid or expired token!');
    }
    if (verificationId.expiresAt < new Date()) {
      throw new BadRequestException('The token has expired.');
    }

    const user = await this.userRepository.findOne({
      where: { id: verificationId.userId },
    });
    console.log(user.id);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const isValid = await this.verificationTokenService.validateOtp(
      user.id,
      token,
      type,
    );

    if (!isValid) {
      throw new BadRequestException('Opt is wrong');
    }
    if (!password) {
      throw new BadRequestException(password);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    await this.verificationRepository.delete({ id: verificationId.id });

    return true;
  }
}
