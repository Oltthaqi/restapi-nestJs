import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUsersDto } from './dto/register-User.dto';
import { Response } from 'express';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login to get a JWT token' })
  @ApiResponse({ status: 200, description: 'JWT access token returned.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user, res);
  }
  @ApiOperation({ summary: 'Register an user' })
  @ApiBody({ type: RegisterUsersDto })
  @Post('Register')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.USER)
  async register(@Body() registerUserDto: RegisterUsersDto) {
    return this.authService.register(registerUserDto);
  }

  // @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const user = await this.authService.verifyRefreshToken(req);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.authService.refreshToken(user);
  }
}
