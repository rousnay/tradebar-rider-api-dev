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
  import { UserPaymentHistoryService } from './user-payment-history.service';
  import { UserPaymentHistory } from './user-payment-history.entity';
//   import { CreateUserPaymentInfoDto } from './dtos/create-user-payment-history.dto';
  import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
  
  @ApiTags("Payment History")
  @Controller('payment-history')
  export class UserPaymentHistoryController {
    constructor(private readonly userPaymentHistoryService: UserPaymentHistoryService) {}
  
    @ApiOperation({ summary: 'Get all Payment history' })
    @ApiResponse({
      status: 200,
      description: 'All Payment history',
      type: [UserPaymentHistory],
    })
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access_token')
    async findAll(): Promise<{
      status: string;
      message: string;
      data: UserPaymentHistory[];
    }> {
      const paymentHistory = await this.userPaymentHistoryService.findAll();
      console.log('paymentHistory',paymentHistory);
      
      return {
        status: 'success',
        message: 'All Payment history has been fetched successfully',
        data: paymentHistory,
      };
    }
  
  }
  