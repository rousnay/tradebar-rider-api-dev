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
  
  @ApiTags("Payments")
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
    async findAll(): Promise<{}> {
        const paymentHistory = await this.userPaymentHistoryService.findAll();
        //   console.log('paymentHistory',paymentHistory);
        let total_balance = 0;
        let debit_balance = 0;
        let last_withdraw = 0;

        paymentHistory.filter(item => {
            if(item.transaction_type == 'credit'){
                total_balance += item.net_balance - item.tradebar_fee
            }

            if(item.transaction_type == 'debit'){
                debit_balance += item.settlement_amount
            }
        })

        let reversedArray = paymentHistory.reverse();
        reversedArray.find((item)=>{
            if(item.transaction_type == 'debit'){
                last_withdraw = item.settlement_amount;
            }
        })

        let res_obj = {
            total_balance:total_balance,
            debit_balance:debit_balance,
            last_withdraw:last_withdraw,
            histories:paymentHistory
        }
      
        return {
            status: 'success',
            message: 'All Payment history has been fetched successfully',
            data: res_obj,
            
        };
    }

    @Get('/todays-earnings')
    @ApiOperation({ summary: 'Todays earning history' })
    @ApiResponse({
      status: 200,
      description: 'Get todays earning history',
      content: {
        'application/json': {
          example: {
            message: 'Todays earning history fetched successfully',
            status: 'success',
            data: [
                {
                    "status": "success",
                    "message": "Todays earning history has been fetched successfully",
                    "data": {
                        "total_trips": 7,
                        "total_distance": 5,
                        "total_earnings": 231,
                        "total_trip_time": 10
                    }
                }
            ],
          },
        },
      },
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access_token')
    async earnedToday(): Promise<{}> {
        const today_earnings = await this.userPaymentHistoryService.findTodaysEarning();

      
        return {
            status: 'success',
            message: 'All Payment history has been fetched successfully',
            data: today_earnings,
            
        };
    }
  
  }
  