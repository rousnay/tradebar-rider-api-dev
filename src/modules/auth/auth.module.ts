import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LocalStrategy } from '../../core/guards/local.strategy';
import { JwtStrategy } from '../../core/guards/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';
import { PasswordService } from '../../core/guards/password.service';
import { AuthController } from './auth.controller';
import { Riders } from 'src/modules/riders/entities/riders.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([Riders]),
    // JwtModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '90d' },
      }),
    }),
    // JwtModule.register({
    //   secret: ConfigService.jwtSecret,
    //   signOptions: { expiresIn: '30d' },
    // }),
    // UsersModule,
  ],
  exports: [AuthService, JwtStrategy],
  providers: [AuthService, LocalStrategy, JwtStrategy, PasswordService],
  controllers: [AuthController],
})
export class AuthModule {}
