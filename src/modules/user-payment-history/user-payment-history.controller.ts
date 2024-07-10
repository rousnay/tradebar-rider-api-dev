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
  
    @Get()
    @ApiOperation({ summary: 'Get all Payment history' })
    @ApiResponse({
      status: 200,
      description: 'Get the list of payment history',
      content: {
        'application/json': {
          example: {
            message: 'Payment history list fetched successfully',
            status: 'success',
            data: [
              {
                "id": 1,
                "transaction_type": "credit",
                "payment_status": "paid",
                "payment_by": "customer",
                "payment_for": "rider",
                "payment_id": 132,
                "customer_id": 22,
                "warehouse_id": 1,
                "rider_id": 25,
                "order_id": 293,
                "settlement_id": 1,
                "fare_amount": 30,
                "gst": 3,
                "tradebar_fee": 3,
                "net_balance": 100,
                "payable_amount": 100,
                "created_at": "2024-07-04T03:32:44.695Z",
                "partial_paid_at": "2024-07-04T03:32:44.695Z",
                "paid_at": "2024-07-04T03:32:44.000Z",
                "failed_at": "2024-07-04T03:32:44.000Z",
                "partial_refunded_at": "2024-07-04T03:32:44.000Z",
                "refunded_at": "2024-07-04T03:32:44.000Z",
                "settlement_at": "2024-07-04T03:32:44.000Z",
                "updated_at": "2024-07-09T04:25:14.393Z"
              },
            ],
          },
        },
      },
    })
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
  