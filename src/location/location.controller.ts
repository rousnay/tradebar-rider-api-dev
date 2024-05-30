// src/location/location.controller.ts
import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from './schemas/location.schema';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get(':riderId')
  async getLocation(@Param('riderId') riderId: string): Promise<Location> {
    return this.locationService.getLocation(riderId);
  }

  @Put(':riderId')
  async updateLocation(
    @Param('riderId') riderId: string,
    @Body() updateLocationDto: { latitude: number; longitude: number },
  ): Promise<Location> {
    const { latitude, longitude } = updateLocationDto;
    return this.locationService.updateLocation(riderId, latitude, longitude);
  }
}
