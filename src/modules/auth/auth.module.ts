import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from '@core/guards/jwt.strategy';
import { PasswordService } from '@core/guards/password.service';
import { LocalStrategy } from '@core/guards/local.strategy';
import { ConfigService } from '@config/config.service';
import { ConfigModule } from '@config/config.module';
import { Riders } from '@modules/riders/entities/riders.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ReviewService } from '@modules/review/review.service';
import { RidersService } from '@modules/riders/services/riders.service';
import { MailService } from '@services/mail.service';
import { RidersModule } from '@modules/riders/riders.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeliveryRequest,
  DeliveryRequestSchema,
} from '@modules/delivery/schemas/delivery-request.schema';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    RidersModule,
    TypeOrmModule.forFeature([Riders]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '90d' },
      }),
    }),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
    ]),
  ],
  exports: [AuthService, JwtStrategy],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    PasswordService,
    ReviewService,
    RidersService,
    MailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
