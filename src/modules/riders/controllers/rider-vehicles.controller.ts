import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UsePipes,
  UseGuards,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RiderVehiclesService } from '../services/rider-vehicles.service';
import { CreateRiderVehicleDto } from '../dtos/create-rider-vehicle.dto';
import { UpdateRiderVehicleDto } from '../dtos/update-rider-vehicle.dto';
import { RiderVehicles } from '../entities/rider-vehicles.entity';

@Controller('rider/vehicle')
@ApiTags('Rider')
export class RiderVehiclesController {
  constructor(private readonly riderVehiclesService: RiderVehiclesService) {}

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all vehicles of rider' })
  getAllVehiclesOfRider(): Promise<RiderVehicles[]> {
    return this.riderVehiclesService.getAllVehiclesOfRider();
  }

  @Get('/:vehicle_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get vehicle by id' })
  getVehicleById(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
  ): Promise<RiderVehicles> {
    return this.riderVehiclesService.getVehicleById(vehicle_id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add new vehicle' })
  @ApiBody({ type: CreateRiderVehicleDto })
  addVehicle(
    @Body() createRiderVehicleDto: CreateRiderVehicleDto,
  ): Promise<RiderVehicles> {
    return this.riderVehiclesService.addVehicle(createRiderVehicleDto);
  }

  @Put(':vehicle_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update vehicle by id' })
  @ApiBody({ type: UpdateRiderVehicleDto })
  updateVehicle(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
    @Body() updateRiderVehicleDto: UpdateRiderVehicleDto,
  ): Promise<RiderVehicles> {
    return this.riderVehiclesService.updateVehicle(
      vehicle_id,
      updateRiderVehicleDto,
    );
  }
}
