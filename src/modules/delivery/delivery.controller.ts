import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@Controller('deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}
}
