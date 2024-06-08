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
  UpdateLocationOfRiderSwagger,
} from './decorators/swagger-decorators';
import { LocationService } from './location.service';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UpdateLocationOfRiderSwagger()
  @Put('rider/:riderId')
  async updateLocation(
    @Param('riderId') riderId: number,
    @Body() updateLocationDto: { latitude: number; longitude: number },
  ): Promise<Location> {
    const { latitude, longitude } = updateLocationDto;
    return this.locationService.updateLocation(riderId, latitude, longitude);
  }

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
}
