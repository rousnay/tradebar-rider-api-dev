import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Query,
  Post,
  ParseIntPipe,
  ParseFloatPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Location } from './schemas/location.schema';
import { SetCoordinatesAndSimulateDto } from './dtos/set-coordinates-and-simulate.dto';
import {
  GetLocationOfRiderSwagger,
  GetNearbyRidersSwagger,
  SimulateLocationsSwagger,
  UpdateLocationOfRiderSwagger,
  UpdateOnlineStatusSwagger,
} from './decorators/swagger-decorators';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @SimulateLocationsSwagger()
  @Post('start-simulation')
  async startSimulation(
    @Body() coordinatesAndSimulateDto: SetCoordinatesAndSimulateDto,
  ) {
    const result = await this.locationService.startSimulation(
      coordinatesAndSimulateDto,
    );
    return result;
  }

  @Post('stop-simulation')
  @ApiOperation({
    summary: 'Stop currently running location simulation.',
  })
  stopSimulation() {
    return this.locationService.stopSimulation();
  }

  @UpdateLocationOfRiderSwagger()
  @Put('rider/update-location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async updateLocation(
    @Body()
    updateLocationDto: {
      latitude: number;
      longitude: number;
    },
  ): Promise<{ status: string; message: string; data: Location }> {
    const { latitude, longitude } = updateLocationDto;
    const result = await this.locationService.updateRiderLocation(
      latitude,
      longitude,
    );

    return {
      status: 'success',
      message: 'Rider approval status fetched successfully',
      data: result,
    };
  }

  @UpdateOnlineStatusSwagger()
  @Put('rider/update-online-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async updateOnlineStatus(
    @Body()
    updateActiveStatusDto: {
      isActive: boolean;
      latitude: number;
      longitude: number;
    },
  ): Promise<Location> {
    const { isActive, latitude, longitude } = updateActiveStatusDto;
    return this.locationService.updateOnlineStatus(
      isActive,
      latitude,
      longitude,
    );
  }
}
