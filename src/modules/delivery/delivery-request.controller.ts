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
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeliveryRequestService } from './delivery-request.service';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import { DeliveryRequest } from './schemas/delivery-request.schema';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { UpdateStatusDto } from './dtos/update-status.dto';

@ApiTags('Delivery Requests')
@Controller('delivery-requests')
export class DeliveryRequestController {
  constructor(
    private readonly deliveryRequestService: DeliveryRequestService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
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

  @Patch('accept/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update a delivery request' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the delivery request',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'The updated delivery request',
    type: DeliveryRequest,
  })
  @ApiResponse({ status: 404, description: 'Delivery request not found' })
  async acceptDeliveryRequest(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    const updatedData = await this.deliveryRequestService.acceptDeliveryRequest(
      id,
      req,
    );
    return {
      status: 'success',
      message: 'Delivery request accepted.',
      data: updatedData,
    };
  }
}
