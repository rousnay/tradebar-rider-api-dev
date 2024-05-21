import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../../common/constants/constants';
import { Riders } from './entities/riders.entity'; // Import your RiderEntity
import { RidersService } from './services/riders.service';
import { RiderController } from './controllers/riders.controller';
import { VehicleTypeService } from './services/vehicle-type.service';
import { VehicleTypeController } from './controllers/vehicle-type.controller';
// import { RiderVehiclesService } from './services/rider-vehicles.service';
// import { RiderVehiclesController } from './controllers/rider-vehicles.controller';
import { RiderVehicles } from './entities/rider-vehicles.entity';
import { RiderDrivingController } from './controllers/rider-driving.controller';
import { RiderDrivingService } from './services/rider-driving.service';
import { Vehicles } from './entities/vehicles.entity';
import { VehiclesService } from './services/vehicles.service';
import { VehiclesController } from './controllers/vehicles.controller';
import { CloudFlareMediaService } from 'src/services/cloudFlare_media.service';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Riders, Vehicles, RiderVehicles]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [RidersService],
  providers: [
    RidersService,
    VehiclesService,
    // RiderVehiclesService,
    RiderDrivingService,
    VehicleTypeService,
    // HttpService,
    CloudFlareMediaService,
  ],
  controllers: [
    RiderController,
    VehiclesController,
    // RiderVehiclesController,
    RiderDrivingController,
    VehicleTypeController,
  ],
})
export class RidersModule {}
