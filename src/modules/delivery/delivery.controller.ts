import {
  Controller,
  Request,
  Param,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@Controller('deliveries')
@ApiTags('Deliveries')
export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Trip List' })
  async getAll(@Request() req): Promise<any> {
    const tripList = await this.deliveryService.findAll(req);

    return {
      status: 'success',
      message: 'Successful retrieval of trip list',
      data: tripList,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get trip details by id' })
  @ApiParam({
    name: 'id',
    description: 'The delivery id',
    required: true,
  })
  async getOne(@Request() req, @Param('id') id): Promise<any> {
    const tripList = await this.deliveryService.findOne(req, id);

    return {
      status: 'success',
      message: 'Successful retrieval of trip details',
      data: tripList,
    };
  }
}
