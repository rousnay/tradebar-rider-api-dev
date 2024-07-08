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
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseFilePipeBuilder,
  HttpStatus,
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
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { CloudflareMediaService } from '@services/cloudflare-media-upload.service';
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { Vehicles } from '../entities/vehicles.entity';
import { response } from 'express';

@Controller('rider/vehicle')
@ApiTags('Rider')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly cloudflareMediaService: CloudflareMediaService,
  ) {}

  @Get('/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all vehicles of rider' })
  @ApiQuery({
    name: 'type_id',
    type: Number,
    required: false,
    description: 'Vehicle type id (optional)',
  })
  async getAllVehiclesOfRider(@Query('type_id') type_id?: number): Promise<{
    status: string;
    message: string;
    data: Vehicles[];
  }> {
    const results = await this.vehiclesService.getAllVehiclesOfRider(type_id);

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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'vehicle_front_image', maxCount: 1 },
    { name: 'vehicle_back_image', maxCount: 1 },
  ]))

  async addVehicle(
    @UploadedFiles() files: { vehicle_front_image?: Express.Multer.File[], vehicle_back_image?: Express.Multer.File[] },
    @Body() formData: CreateVehicleDto
  ): Promise<{ message: string; status: string; data: Vehicles }> {

    // console.log('addVehicle: formData', files.vehicle_front_image[0].mimetype);
    // console.log('addVehicle: formData', files.vehicle_back_image[0].mimetype);

    // if(files != null && files.vehicle_front_image[0].mimetype != ('jpg'||'jpeg'||'png'||'gif')){
      
    // }

    let cf_front_media_id = null;
    let cf_back_media_id = null;
    let vehicle_front_image_url = null;
    let vehicle_back_image_url = null;
    let front_file = files.vehicle_front_image != null ? files.vehicle_front_image[0] : null;
    let back_file = files.vehicle_back_image != null ? files.vehicle_back_image[0] : null;

    if (front_file != null) {
      const result = await this.cloudflareMediaService.uploadMedia(
        front_file,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_front_media_id = result?.data?.id;
      vehicle_front_image_url = result?.data?.media_url;
    }

    if (back_file != null) {
      // console.log('vehicle_image exist');
      const result = await this.cloudflareMediaService.uploadMedia(
        back_file,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_back_media_id = result?.data?.id;
      vehicle_back_image_url = result?.data?.media_url;
    }

    const createVehicleDto = new CreateVehicleDto();
    createVehicleDto.owner_id = formData.owner_id
      ? Number(formData.owner_id)
      : null;
    createVehicleDto.type_id = formData.type_id
      ? Number(formData.type_id)
      : null;
    createVehicleDto.brand = formData.brand;
    createVehicleDto.model = formData.model;
    createVehicleDto.year = formData.year ? Number(formData.year) : null;
    createVehicleDto.color = formData.color;
    createVehicleDto.vehicle_image_front_cf_media_id = cf_front_media_id;
    createVehicleDto.vehicle_image_back_cf_media_id = cf_back_media_id;
    createVehicleDto.license_plate = formData.license_plate;
    createVehicleDto.registration_number = formData.registration_number;

    const result = await this.vehiclesService.addVehicle(createVehicleDto);

    result.data.vehicle_front_image_url = vehicle_front_image_url;
    result.data.vehicle_back_image_url = vehicle_back_image_url;

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
  // @UseInterceptors(FileInterceptor('vehicle_image'))
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'vehicle_front_image', maxCount: 1 },
    { name: 'vehicle_back_image', maxCount: 1 },
  ]))
  async updateVehicle(
    @Param('vehicle_id', ParseIntPipe) vehicle_id: number,
    // @UploadedFile() vehicle_image: Express.Multer.File,
    @UploadedFiles() files: { vehicle_front_image?: Express.Multer.File[], vehicle_back_image?: Express.Multer.File[] },
    @Body() formData: UpdateVehicleDto,
  ): Promise<{ message: string; status: string; data: Vehicles }> {
    
    let cf_front_media_id = null;
    let cf_back_media_id = null;
    let vehicle_front_image_url = null;
    let vehicle_back_image_url = null;
    let front_file = files.vehicle_front_image != null ? files.vehicle_front_image[0] : null;
    let back_file = files.vehicle_back_image != null ? files.vehicle_back_image[0] : null;

    if (front_file != null) {
      const result = await this.cloudflareMediaService.uploadMedia(
        front_file,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_front_media_id = result?.data?.id;
      vehicle_front_image_url = result?.data?.media_url;
    }

    if (back_file != null) {
      // console.log('vehicle_image exist');
      const result = await this.cloudflareMediaService.uploadMedia(
        back_file,
        {
          model: 'Rider-vehicleImage',
          model_id: 100,
          image_type: 'thumbnail',
        },
      );
      cf_back_media_id = result?.data?.id;
      vehicle_back_image_url = result?.data?.media_url;
    }

    const updateVehicleDto = new UpdateVehicleDto();
    updateVehicleDto.owner_id = formData.owner_id
      ? Number(formData.owner_id)
      : null;
    updateVehicleDto.type_id = formData.type_id
      ? Number(formData.type_id)
      : null;

    updateVehicleDto.brand = formData.brand;
    updateVehicleDto.model = formData.model;
    updateVehicleDto.year = formData.year ? Number(formData.year) : null;
    updateVehicleDto.color = formData.color;

    if(cf_front_media_id != null) updateVehicleDto.vehicle_image_front_cf_media_id = cf_front_media_id;
    if(cf_back_media_id != null) updateVehicleDto.vehicle_image_back_cf_media_id = cf_back_media_id;

    updateVehicleDto.license_plate = formData.license_plate;
    updateVehicleDto.registration_number = formData.registration_number;

    const result = await this.vehiclesService.updateVehicle(
      vehicle_id,
      updateVehicleDto,
    );

    result.data.vehicle_front_image_url = vehicle_front_image_url;
    result.data.vehicle_back_image_url = vehicle_back_image_url;

    return {
      status: 'success',
      message: 'Vehicle has been updated successfully',
      ...result,
    };
  }
}
