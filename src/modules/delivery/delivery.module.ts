import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
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
import { DeliveryNotificationService } from './delivery.notification.service';
import { ConfigModule } from '@config/config.module';
import { DeliveryPaymentService } from './delivery-payment.service';
import { UserPaymentHistoryService } from '@modules/user-payment-history/user-payment-history.service';
import { UserPaymentHistory } from '@modules/user-payment-history/user-payment-history.entity';

@Module({
  imports: [
    ConfigModule,
    LocationModule,
    NotificationsModule,
    TypeOrmModule.forFeature([DeliveryRequest, UserPaymentHistory]),
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
      {
        name: 'DeliveryRequestNotification',
        schema: DeliveryRequestNotificationSchema,
      },
    ]),
  ],
  exports: [DeliveryService, DeliveryRequestService, DeliveryPaymentService],
  providers: [
    DeliveryService,
    DeliveryRequestService,
    DeliveryNotificationService,
    DeliveryPaymentService,
    UserPaymentHistoryService,
  ],
  controllers: [DeliveryController, DeliveryRequestController],
})
export class DeliveryModule {}
