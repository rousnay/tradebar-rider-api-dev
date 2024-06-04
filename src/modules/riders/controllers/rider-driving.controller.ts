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
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { RiderDrivingService } from '../services/rider-driving.service';
import { UpdateRiderDrivingPreferenceDto } from '../dtos/update-rider-driving-preference.dto';
import { UpdateRiderDrivingLicenseDto } from '../dtos/update-rider-driving-license.dto';

@ApiTags('Rider')
@Controller('rider/driving')
export class RiderDrivingController {
  constructor(private readonly riderDrivingService: RiderDrivingService) {}

  @Put('/preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update rider driving preferences' })
  @ApiBody({ type: UpdateRiderDrivingPreferenceDto })
  async updateDrivingPreferences(
    @Body() updateRiderDrivingPreferenceDto: UpdateRiderDrivingPreferenceDto,
  ) {
    return this.riderDrivingService.updateDrivingPreferences(
      updateRiderDrivingPreferenceDto,
    );
  }

  @Put('/license')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update rider driving license' })
  @ApiBody({ type: UpdateRiderDrivingLicenseDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('driving_license_image'),
    FileInterceptor('driving_verification_selfie_image'),
  )
  async updateDrivingLicense(
    @Body() updateRiderDrivingLicenseDto: UpdateRiderDrivingLicenseDto,
    @UploadedFile() driving_license_image: Express.Multer.File,
    @UploadedFile() driving_verification_selfie_image: Express.Multer.File,
  ) {
    return this.riderDrivingService.updateDrivingLicense(
      updateRiderDrivingLicenseDto,
      driving_license_image,
      driving_verification_selfie_image,
    );
  }
}
