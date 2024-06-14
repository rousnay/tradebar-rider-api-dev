import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DeliveryRequestService } from './delivery-request.service';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import { DeliveryRequest } from './schemas/delivery-request.schema';

@ApiTags('Delivery Requests')
@Controller('delivery-requests')
export class DeliveryRequestController {
  constructor(
    private readonly deliveryRequestService: DeliveryRequestService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all delivery requests' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of delivery requests',
    type: [DeliveryRequest],
  })
  async findAll(): Promise<{
    status: string;
    message: string;
    data: DeliveryRequest[];
  }> {
    const requests = await this.deliveryRequestService.findAll();
    return {
      status: 'success',
      message: 'Successful retrieval of delivery requests',
      data: requests,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of the delivery request',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  async findOne(
    @Param('id') id: string,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    const request = await this.deliveryRequestService.findOne(id);
    return {
      status: 'success',
      message: 'Successful retrieval of the delivery request',
      data: request,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a delivery request by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the delivery request' })
  @ApiResponse({
    status: 200,
    description: 'The delivery request has been successfully updated.',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  @ApiBody({ type: UpdateDeliveryRequestDto })
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateDeliveryRequestDto: UpdateDeliveryRequestDto,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    if (updateDeliveryRequestDto.status) {
      await this.deliveryRequestService.updateStatus(
        id,
        updateDeliveryRequestDto.status,
      );
    }
    if (updateDeliveryRequestDto.assignedRider) {
      await this.deliveryRequestService.updateAssignedRider(
        id,
        updateDeliveryRequestDto.assignedRider,
      );
    }
    const request = await this.deliveryRequestService.findOne(id);

    return {
      status: 'success',
      message: 'The delivery request has been successfully updated.',
      data: request,
    };
  }
}
