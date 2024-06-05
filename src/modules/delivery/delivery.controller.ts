import { Controller, Get, Param } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './models/delivery.model';
import { ApiTags } from '@nestjs/swagger';

@Controller('deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async getDeliveryRequests(): Promise<Delivery[]> {
    return this.deliveryService.getDeliveryRequests();
  }

  @Get(':id')
  async getDeliveryRequestById(@Param('id') id: string): Promise<Delivery> {
    return this.deliveryService.getDeliveryRequestById(id);
  }
}
