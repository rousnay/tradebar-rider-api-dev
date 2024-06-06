import { Controller, Get, Param, Put } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { Delivery } from './models/delivery.model';
import { ApiTags } from '@nestjs/swagger';

@Controller('delivery-requests')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('all')
  async getDeliveryRequests(): Promise<Delivery[]> {
    return this.deliveryService.getDeliveryRequests();
  }

  @Get(':id')
  async getDeliveryRequestById(@Param('id') id: number): Promise<Delivery> {
    return this.deliveryService.getDeliveryRequestById(id);
  }

  @Put('accept/:id')
  async acceptDeliveryRequest(@Param('id') id: number): Promise<Delivery> {
    return this.deliveryService.acceptDeliveryRequest(id);
  }
}
