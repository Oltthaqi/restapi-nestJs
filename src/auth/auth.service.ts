/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { RegisterUsersDto } from './dto/register-User.dto';
import { EmailService } from 'src/message/email.service';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UsersService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerUserDto: RegisterUsersDto): Promise<User> {
    const userExists = await this.userRepository.findOne({
      where: { username: registerUserDto.username },
    });
    if (userExists) {
      throw new HttpException('User already exists.', HttpStatus.CONFLICT);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      registerUserDto.password,
      saltRounds,
    );

    const newUser = this.userRepository.create({
      ...registerUserDto,
      role: UserRole.USER,
      password: hashedPassword,
      isVerified: false,
    });

    await this.userRepository.save(newUser);
    await this.userService.generateEmailVerification(newUser.id);

    return newUser;
  }

  async login(user: User) {
    if (user.accountStatus === 'inactive') {
      throw new ForbiddenException('Account is not verified.');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async verifyRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
      return {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      } as User;
    } catch (error) {
      return null;
    }
  }

  async refreshToken(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
