import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserBankInfoService } from './user-bank-info.service';
import { UserBankInfo } from './user-bank-info.entity';
import { CreateUserBankInfoDto } from './dtos/create-user-bank-info.dto';
import { UpdateUserBankInfoDto } from './dtos/update-user-bank-info.dto';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';

@ApiTags("Rider's Bank Info")
@Controller('rider-bank-info')
export class UserBankInfoController {
  constructor(private readonly userBankInfoService: UserBankInfoService) {}

  @ApiOperation({ summary: 'Create a new bank info record' })
  @ApiResponse({
    status: 201,
    description: 'The bank info record has been successfully created.',
    type: UserBankInfo,
  })
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async create(@Body() createUserBankInfoDto: CreateUserBankInfoDto): Promise<{
    status: string;
    message: string;
    data: UserBankInfo;
  }> {
    const bankInfo = await this.userBankInfoService.create(
      createUserBankInfoDto,
    );
    return {
      status: 'success',
      message: 'New bank info has been created successfully',
      data: bankInfo,
    };
  }

  @ApiOperation({ summary: 'Get all bank info records' })
  @ApiResponse({
    status: 200,
    description: 'All bank info records',
    type: [UserBankInfo],
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async findAll(): Promise<{
    status: string;
    message: string;
    data: UserBankInfo[];
  }> {
    const bankInfos = await this.userBankInfoService.findAll();
    return {
      status: 'success',
      message: 'All bank info records has been fetched successfully',
      data: bankInfos,
    };
  }

  @ApiOperation({ summary: 'Get a bank info record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The bank info record',
    type: UserBankInfo,
  })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async findOne(@Param('id') id: number): Promise<{
    status: string;
    message: string;
    data: UserBankInfo;
  }> {
    const bankInfo = await this.userBankInfoService.findOne(id);
    return {
      status: 'success',
      message: 'Bank info by id has been fetched successfully',
      data: bankInfo,
    };
  }

  @ApiOperation({ summary: 'Update a bank info record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The bank info record has been successfully updated.',
    type: UserBankInfo,
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async update(
    @Param('id') id: number,
    @Body() updateUserBankInfoDto: UpdateUserBankInfoDto,
  ): Promise<{
    status: string;
    message: string;
    data: UserBankInfo;
  }> {
    const bankInfo = await this.userBankInfoService.update(
      id,
      updateUserBankInfoDto,
    );
    return {
      status: 'success',
      message: 'The bank info record has been successfully updated.',
      data: bankInfo,
    };
  }

  @ApiOperation({ summary: 'Set an address as default by id' })
  @Put('set-default/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async setDefaultBank(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ status: string; message: string; data: UserBankInfo }> {
    const bankInfo = await this.userBankInfoService.setDefaultBankById(id);
    return {
      status: 'success',
      message: 'The bank info has been set as default successfully',
      data: bankInfo,
    };
  }

  @ApiOperation({ summary: 'Delete a bank info record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The bank info record has been successfully deleted.',
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async remove(@Param('id') id: number) {
    return this.userBankInfoService.remove(id);
  }

  //   @ApiOperation({ summary: 'Get bank info records by user type and user ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'The bank info records for the specified user',
  //     type: [UserBankInfo],
  //   })
  //   @Get('/user/:userType/:userId')
  //   findByUser(
  //     @Param('userType') userType: string,
  //     @Param('userId') userId: number,
  //   ) {
  //     return this.userBankInfoService.findByUser(userType, userId);
  //   }
}
