import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PasswordService } from './password.service';
import { AuthController } from './auth.controller';
import { Riders } from 'src/riders/entities/riders.entity';

@Module({
  imports: [
    // UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([Riders]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  exports: [AuthService, JwtStrategy],
  providers: [AuthService, LocalStrategy, JwtStrategy, PasswordService],
  controllers: [AuthController],
})
export class AuthModule {}
