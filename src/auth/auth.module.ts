import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './Strategy/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { RefreshJwtStrategy } from './Strategy/refreshToken.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: 'yourSecretKey',
        signOptions: { expiresIn: '100m' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
