import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/constants/constants';
import { Riders } from './entities/riders.entity'; // Import your RiderEntity
import { RidersService } from './services/riders.service';
import { RiderController } from './controllers/riders.controller';
import { VehicleTypeService } from './services/vehicle-type.service';
import { VehicleTypeController } from './controllers/vehicle-type.controller';
import { RiderVehiclesService } from './services/rider-vehicles.service';
import { RiderVehiclesController } from './controllers/rider-vehicles.controller';
import { RiderVehicles } from './entities/rider-vehicles.entity';
import { RiderDrivingController } from './controllers/rider-driving.controller';
import { RiderDrivingService } from './services/rider-driving.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Riders, RiderVehicles]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [RidersService],
  providers: [
    RidersService,
    RiderVehiclesService,
    VehicleTypeService,
    RiderDrivingService,
  ],
  controllers: [
    RiderController,
    RiderVehiclesController,
    VehicleTypeController,
    RiderDrivingController,
  ],
})
export class RidersModule {}
