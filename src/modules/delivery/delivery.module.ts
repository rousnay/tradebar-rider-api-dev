import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySchema } from './schemas/delivery.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Delivery', schema: DeliverySchema }]),
    TypeOrmModule.forFeature([DeliveryService]),
  ],

  exports: [],
  providers: [DeliveryService],
  controllers: [DeliveryController],
})
export class DeliveryModule {}
