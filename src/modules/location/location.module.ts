import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationGateway } from './location.gateway';
import { LocationSchema } from './schemas/location.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicles } from '@modules/riders/entities/vehicles.entity';
import { OngoingOrderSchema } from './schemas/ongoing-order.schema';
// import { DeliveryRequestService } from '@modules/delivery/delivery-request.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Location', schema: LocationSchema },
      { name: 'OngoingOrder', schema: OngoingOrderSchema },
    ]),
    TypeOrmModule.forFeature([Vehicles]),
  ],
  providers: [LocationService, LocationGateway],
  exports: [LocationService, LocationGateway],
  controllers: [LocationController],
})
export class LocationModule {}
