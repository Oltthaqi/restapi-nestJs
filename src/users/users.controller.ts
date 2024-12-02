import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { dataSourceOptions } from 'db/data-source';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/Decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/user-role.enum';

import { User } from './entities/user.entity';
import { Request as ExpressRequest } from 'express';
import { SessionGuard } from 'src/auth/guards/session.guard';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBadRequestResponse()
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @UseGuards(RolesGuard, SessionGuard)
  @Roles(UserRole.ADMIN)
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return await this.usersService.findAll(page, limit);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    console.log(dataSourceOptions.entities);
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // @Post('verification-otp')
  // async generateEmailVerification(@CurrentUser() user: User) {
  //   if (!user) {
  //     throw new Error('No user logon');
  //   }
  //   await this.usersService.generateEmailVerification(user.id);

  //   return { status: 'success', message: 'Sending email in a moment' };
  // }

  @Post('verify/:otp')
  async verifyEmail(@Param('otp') otp: string) {
    const result = await this.usersService.verifyEmail(otp);

    return { status: result ? 'sucess' : 'failure', message: null };
  }
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Post('reset-password')
  async generateEmailResetPassword(
    @Req() req: ExpressRequest,
  ): Promise<{ message: string }> {
    const user = req.user as User;

    const resetPasswordDto = user.email;
    console.log('ffgfdefde0', resetPasswordDto);

    await this.usersService.generateEmailResetPassword(resetPasswordDto);

    return {
      message:
        'OTP for password reset has been sent to the provided email address',
    };
  }

  @Patch('reset-password/:token')
  @ApiParam({
    name: 'token',
    type: String,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          example: 'new_secure_password',
        },
      },
    },
  })
  async resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
  ): Promise<{ message: string }> {
    await this.usersService.resetPassword(token, password);

    return { message: 'Password has been reset successfully' };
  }
}
