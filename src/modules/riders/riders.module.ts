import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule, HttpService } from '@nestjs/axios';

import { ConfigModule } from '@config/config.module';
import { CloudflareMediaService } from '@services/cloudflare-media-upload.service';
import { Riders } from './entities/riders.entity';
import { RidersService } from './services/riders.service';
import { RiderController } from './controllers/riders.controller';
import { VehicleTypeService } from './services/vehicle-type.service';
import { VehicleTypeController } from './controllers/vehicle-type.controller';
import { RiderVehicles } from './entities/rider-vehicles.entity';
import { RiderDrivingController } from './controllers/rider-driving.controller';
import { RiderDrivingService } from './services/rider-driving.service';
import { Vehicles } from './entities/vehicles.entity';
import { VehiclesService } from './services/vehicles.service';
import { VehiclesController } from './controllers/vehicles.controller';
import { MailService } from '@services/mail.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Riders, Vehicles, RiderVehicles]),
  ],
  exports: [RidersService],
  providers: [
    // HttpService,
    RidersService,
    VehiclesService,
    RiderDrivingService,
    VehicleTypeService,
    CloudflareMediaService,
    MailService,
  ],
  controllers: [
    RiderController,
    VehiclesController,
    RiderDrivingController,
    VehicleTypeController,
  ],
})
export class RidersModule {}
