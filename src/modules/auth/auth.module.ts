import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LocalStrategy } from '../../core/guards/local.strategy';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/constants/constants';
import { PasswordService } from '../../core/guards/password.service';
import { AuthController } from './auth.controller';
import { Riders } from 'src/modules/riders/entities/riders.entity';

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
