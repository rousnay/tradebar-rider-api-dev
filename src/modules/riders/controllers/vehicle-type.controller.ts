import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { VehicleTypeService } from '../services/vehicle-type.service';
import { VehicleTypeDto } from '../dtos/vehicle-type.dto';

@ApiTags('Vehicles')
@Controller('vehicle-type')
export class VehicleTypeController {
  constructor(private readonly vehicleTypeService: VehicleTypeService) {}

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all vehicle types' })
  @ApiResponse({ status: 200, type: [VehicleTypeService] })
  async findAll(): Promise<{
    status: string;
    message: string;
    data: VehicleTypeDto[];
  }> {
    const vehicleType = await this.vehicleTypeService.findAll();
    if (!vehicleType) {
      throw new NotFoundException('Vehicle type not found');
    }
    return {
      status: 'success',
      message: 'Vehicle type fetched successfully',
      data: vehicleType,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get vehicle type by id' })
  async findOne(@Param('id') id: number): Promise<{
    status: string;
    message: string;
    data: VehicleTypeDto;
  }> {
    const vehicle = await this.vehicleTypeService.findOne(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle type not found');
    }
    return {
      status: 'success',
      message: 'Vehicle type has fetched successfully',
      data: vehicle,
    };
  }
}
