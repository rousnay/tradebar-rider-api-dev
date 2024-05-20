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
  ValidationPipe,
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
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { Vehicles } from '../entities/vehicles.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudFlareMediaService } from 'src/services/cloud_flare_media.service';

@Controller('rider/vehicle')
@ApiTags('Rider')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly cloudFlareMediaService: CloudFlareMediaService,
  ) {}

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all vehicles of rider' })
  async getAllVehiclesOfRider(): Promise<{
    status: string;
    message: string;
    data: Vehicles[];
  }> {
    const results = await this.vehiclesService.getAllVehiclesOfRider();

    return {
      status: 'success',
      message: 'Vehicles fetched successfully',
      data: results,
    };
  }

  @Get('/:vehicle_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get vehicle by id' })
  async getVehicleById(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
  ): Promise<{ message: string; status: string; data: Vehicles }> {
    const result = await this.vehiclesService.getVehicleById(vehicle_id);

    return {
      status: 'success',
      message: 'Vehicle has been added successfully',
      ...result,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Add new vehicle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateVehicleDto })
  @UseInterceptors(FileInterceptor('vehicle_image'))
  async addVehicle(
    @UploadedFile() vehicle_image: Express.Multer.File,
    @Body() formData: CreateVehicleDto,
  ): Promise<{ message: string; status: string; data: Vehicles }> {
    let cf_media_id = null;
    let vehicle_image_url = null;

    if (vehicle_image) {
      console.log('vehicle_image exist');
      const result = await this.cloudFlareMediaService.uploadMedia(
        vehicle_image,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_media_id = result?.data?.id;
      vehicle_image_url = result?.data?.media_url;
    }

    const createVehicleDto = new CreateVehicleDto();
    createVehicleDto.owner_id = formData.owner_id || null;
    createVehicleDto.type_id = formData.type_id || null;
    createVehicleDto.brand = formData.brand;
    createVehicleDto.model = formData.model;
    createVehicleDto.color = formData.color;
    createVehicleDto.vehicle_image_cf_media_id = cf_media_id;
    createVehicleDto.license_plate = formData.license_plate;
    createVehicleDto.registration_number = formData.registration_number;

    const result = await this.vehiclesService.addVehicle(createVehicleDto);

    result.data.vehicle_image_url = vehicle_image_url;

    return {
      status: 'success',
      message: 'Vehicle has been added successfully',
      ...result,
    };
  }

  @Put(':vehicle_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update vehicle by id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateVehicleDto })
  @UseInterceptors(FileInterceptor('vehicle_image'))
  async updateVehicle(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
    @UploadedFile() vehicle_image: Express.Multer.File,
    @Body() formData: UpdateVehicleDto,
  ): Promise<{ message: string; status: string; data: Vehicles }> {
    let cf_media_id = null;
    let vehicle_image_url = null;

    if (vehicle_image) {
      console.log('vehicle_image exist');
      const result = await this.cloudFlareMediaService.uploadMedia(
        vehicle_image,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_media_id = result?.data?.id;
      vehicle_image_url = result?.data?.media_url;
    }

    const updateVehicleDto = new UpdateVehicleDto();
    updateVehicleDto.owner_id = formData.owner_id || null;
    updateVehicleDto.type_id = formData.type_id || null;
    updateVehicleDto.brand = formData.brand;
    updateVehicleDto.model = formData.model;
    updateVehicleDto.color = formData.color;
    updateVehicleDto.vehicle_image_cf_media_id = cf_media_id;
    updateVehicleDto.license_plate = formData.license_plate;
    updateVehicleDto.registration_number = formData.registration_number;

    const result = await this.vehiclesService.updateVehicle(
      vehicle_id,
      updateVehicleDto,
    );

    result.data.vehicle_image_url = vehicle_image_url;

    return {
      status: 'success',
      message: 'Vehicle has been added successfully',
      ...result,
    };
  }
}
