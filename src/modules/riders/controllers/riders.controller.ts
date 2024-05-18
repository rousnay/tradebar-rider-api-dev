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
import { RidersService } from '../services/riders.service';

import { Riders } from '../entities/riders.entity';
import { RiderQueryParamsPipe } from '../riders-query-params.pipe';
import { ApiResponseDto } from '../dtos/api-response.dto';
// import { CreateRiderDto } from '../dtos/create-rider.dto';
import { UpdateRidersDto } from '../dtos/update-riders.dto';
import { RidersQueryParamsDto } from '../dtos/riders-query-params.dto';

// @ApiHeader({
//   name: 'X-MyHeader',
//   description: 'Custom header',
// })
@Controller('rider')
@ApiTags('Rider')
export class RiderController {
  constructor(private ridersService: RidersService) {}

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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update rider profile' })
  @ApiBody({ type: UpdateRidersDto })
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: diskStorage({
        destination: '/tmp', // Destination folder for uploaded files
        filename: (req, file, callback) => {
          const originalName = file.originalname;
          const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
          const time = new Date().toLocaleTimeString('en-US', {
            hour12: false,
          }); // Current time in HH:MM:SS format
          const formattedTime = time.replace(/:/g, '-'); // Replacing colons with underscores for HH_MM_SS
          const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number

          const fileNameParts = [
            originalName.replace(/\.[^/.]+$/, ''), // File name without extension
            date,
            formattedTime,
            randomNumber.toString(),
          ];

          const finalFileName =
            fileNameParts.join('_') + extname(file.originalname); // Join parts with underscores
          return callback(null, finalFileName);
        },
      }),
    }),
  )
  @ApiResponse({ status: 200, type: Riders })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  public async editRiderProfile(
    @UploadedFile() profile_image: Express.Multer.File,
    @Body() formData: UpdateRidersDto, // Use FormDataPipe
  ): Promise<{ message: string; status: string; data: Riders }> {
    const updateRiderDto = new UpdateRidersDto();
    updateRiderDto.first_name = formData.first_name;
    updateRiderDto.last_name = formData.last_name;
    updateRiderDto.phone = formData.phone;
    updateRiderDto.email = formData.email;
    updateRiderDto.date_of_birth = formData.date_of_birth;
    updateRiderDto.gender = formData.gender;
    updateRiderDto.is_active = formData.is_active;

    if (profile_image) {
      console.log(profile_image);
      const filePath = profile_image.path; // Path to the uploaded file
      console.log(filePath);
    }

    const result = await this.ridersService.editRiderProfile(updateRiderDto);

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
