import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
  Put,
  Body,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBody,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { DeliveryRequestService } from './delivery-request.service';
import { DeliveryRequest } from './schemas/delivery-request.schema';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { ShippingStatus } from '@common/enums/delivery.enum';
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
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    const updatedData = await this.deliveryRequestService.acceptDeliveryRequest(
      req,
      id,
    );
    return {
      status: 'success',
      message: 'Delivery request accepted.',
      data: updatedData,
    };
  }

  @Put('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update delivery request status' })
  @ApiResponse({ status: 200, description: 'Updated successfully' })
  @ApiNotFoundResponse({ description: 'Delivery request not found' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ShippingStatus,
    description: 'Filter shipments by their status',
  })
  @ApiProperty({ enum: ShippingStatus, description: 'Shipping status' })
  async updateDeliveryRequestStatus(
    @Request() req,
    @Param('id') id: number,
    @Query('status') status?: ShippingStatus,
  ): Promise<{ status: string; message: string; data: DeliveryRequest }> {
    const updatedDeliveryRequest =
      await this.deliveryRequestService.updateDeliveryRequestStatus(
        req,
        id,
        status,
      );
    if (!updatedDeliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    return {
      status: 'success',
      message: 'Delivery status updated.',
      data: updatedDeliveryRequest,
    };
  }
}
