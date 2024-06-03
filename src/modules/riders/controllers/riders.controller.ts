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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { profileImageInterceptor } from '../../../core/interceptors/file-interceptor';
import { RidersService } from '../services/riders.service';

import { Riders } from '../entities/riders.entity';
import { RiderQueryParamsPipe } from '../riders-query-params.pipe';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { UpdateRiderDto } from '../dtos/update-riders.dto';
import { RidersQueryParamsDto } from '../dtos/riders-query-params.dto';
// import { CloudflareMediaService } from '../../../services/cloudflare-media.service';
import { CloudflareMediaService } from '@services/cloudflare-media.service';

// @ApiHeader({
//   name: 'X-MyHeader',
//   description: 'Custom header',
// })
@Controller('rider')
@ApiTags('Rider')
export class RiderController {
  constructor(
    private ridersService: RidersService,
    private readonly cloudflareMediaService: CloudflareMediaService,
  ) {}

  // Get all riders ++++++++++++++++++++++++++++++++++++
  @Get('all')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access_token')
  @ApiOperation({
    summary: 'Get all riders',
    // description: 'Returns an example response',
  })
  @UsePipes(new RiderQueryParamsPipe())
  public async getRiders(
    @Query() queryParams: RidersQueryParamsDto,
  ): Promise<ApiResponseDto<Riders[]>> {
    const riders = await this.ridersService.getRiders({
      ...queryParams,
    });

    return riders;
  }

  // Get logged in rider profile +++++++++++++++++++++++++++++++++
  @Get('profile')
  @ApiOperation({ summary: 'Get logged in rider profile' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async getRiderProfile(): Promise<{
    message: string;
    status: string;
    data: Riders;
  }> {
    try {
      const result = await this.ridersService.getLoggedInRiderProfile();
      return {
        status: 'success',
        message: 'Logged in rider profile has been fetched successfully',
        ...result,
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Edit a rider profile ++++++++++++++++++++++++++++++++
  @Patch('/profile/edit/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update rider profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateRiderDto })
  // @UseInterceptors(profileImageInterceptor)
  @UseInterceptors(FileInterceptor('profile_image'))
  @ApiResponse({ status: 200, type: Riders })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async editRiderProfile(
    @UploadedFile() profile_image: Express.Multer.File,
    @Body() formData: UpdateRiderDto, // Use FormDataPipe
  ): Promise<{ message: string; status: string; data: Riders }> {
    let cf_media_id = null;
    let profile_image_url = null;

    if (profile_image) {
      const result = await this.cloudflareMediaService.uploadMedia(
        profile_image,
        {
          model: 'Rider-ProfileImage',
          model_id: 99,
          image_type: 'thumbnail',
        },
      );
      cf_media_id = result?.data?.id;
      profile_image_url = result?.data?.media_url;
    }

    const updateRiderDto = new UpdateRiderDto();
    updateRiderDto.first_name = formData.first_name;
    updateRiderDto.last_name = formData.last_name;
    updateRiderDto.phone = formData.phone;
    updateRiderDto.email = formData.email;
    updateRiderDto.date_of_birth = formData.date_of_birth;
    updateRiderDto.gender = formData.gender;
    updateRiderDto.profile_image_cf_media_id = cf_media_id;

    const result = await this.ridersService.editRiderProfile(updateRiderDto);

    result.data.profile_image_url = profile_image_url;

    return {
      status: 'success',
      message: 'Rider updated successfully',
      ...result,
    };
  }

  // Get a rider by ID ++++++++++++++++++++++++++++++++++
  @Get('/:riderId')
  @ApiOperation({ summary: 'Get a rider by ID' })
  @ApiParam({ name: 'riderId', type: Number })
  @ApiResponse({ status: 200, type: Riders })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async getRiderById(
    @Param('riderId', ParseIntPipe) riderId: number,
  ): Promise<{ message: string; status: string; data: Riders }> {
    const result = await this.ridersService.getRiderById(riderId);
    return {
      status: 'success',
      message: 'Rider fetched successfully',
      ...result,
    };
  }
}
