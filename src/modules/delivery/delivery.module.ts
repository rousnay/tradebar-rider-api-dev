import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { LocationService } from '@modules/location/location.service';
import { LocationSchema } from '@modules/location/schemas/location.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationModule } from '@modules/location/location.module';
import {
  DeliveryRequest,
  DeliveryRequestSchema,
} from './schemas/delivery-request.schema';
import { DeliveryRequestService } from './delivery-request.service';
import { DeliveryRequestController } from './delivery-request.controller';
import { NotificationsModule } from '@modules/notification/notification.module';
import { DeliveryRequestNotificationSchema } from '@modules/notification/notification.schema';

@Module({
  imports: [
    LocationModule,
    NotificationsModule,
    TypeOrmModule.forFeature([DeliveryRequest]),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
      {
        name: 'DeliveryRequestNotification',
        schema: DeliveryRequestNotificationSchema,
      },
    ]),
  ],
  exports: [DeliveryService, DeliveryRequestService],
  providers: [DeliveryService, DeliveryRequestService],
  controllers: [DeliveryController, DeliveryRequestController],
})
export class DeliveryModule {}
