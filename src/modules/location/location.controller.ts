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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { Location } from './schemas/location.schema';
import { SetCoordinatesAndSimulateDto } from './dtos/set-coordinates-and-simulate.dto';
import {
  GetLocationOfRiderSwagger,
  GetNearbyRidersSwagger,
  SimulateLocationsSwagger,
  UpdateActiveStatusSwagger,
  UpdateLocationOfRiderSwagger,
} from './decorators/swagger-decorators';
import { LocationService } from './location.service';

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
  @Put('rider/update/:riderId')
  async updateLocation(
    @Param('riderId') riderId: number,
    @Body()
    updateLocationDto: {
      latitude: number;
      longitude: number;
      isActive?: boolean;
    },
  ): Promise<Location> {
    const { latitude, longitude, isActive } = updateLocationDto;
    return this.locationService.updateLocation(
      riderId,
      latitude,
      longitude,
      isActive,
    );
  }

  @UpdateActiveStatusSwagger()
  @Put('rider/status/:riderId')
  async updateActiveStatus(
    @Param('riderId') riderId: number,
    @Body()
    updateActiveStatusDto: {
      isActive: boolean;
    },
  ): Promise<Location> {
    const { isActive } = updateActiveStatusDto;
    return this.locationService.updateActiveStatus(riderId, isActive);
  }
}
