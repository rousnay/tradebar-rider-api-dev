import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/constants/constants';
import { Riders } from './entities/riders.entity'; // Import your RiderEntity
import { RidersService } from './services/riders.service';
import { RiderController } from './controllers/riders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Riders]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [RidersService],
  providers: [RidersService],
  controllers: [RiderController],
})
export class RidersModule {}
