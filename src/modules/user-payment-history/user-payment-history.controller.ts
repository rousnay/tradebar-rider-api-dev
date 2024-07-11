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

@ApiTags('Payments')
@Controller('payments')
export class UserPaymentHistoryController {
  constructor(
    private readonly userPaymentHistoryService: UserPaymentHistoryService,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Get all Payment history' })
  @ApiResponse({
    status: 200,
    description: 'Get the list of payment history',
    content: {
      'application/json': {
        example: {
          message: 'Payment history list fetched successfully',
          status: 'success',
          data: {
            current_balance: 48,
            last_settlement_amount: 20,
            payment_history: [
              {
                id: 8,
                transaction_type: 'debit',
                payment_status: 'paid',
                payment_by: 'customer',
                payment_for: 'rider',
                payment_id: 132,
                customer_id: 2,
                warehouse_id: null,
                rider_id: 3,
                order_id: 293,
                fare_amount: 30,
                gst: 3,
                tradebar_fee: 3,
                net_balance: null,
                payable_amount: null,
                settlement_amount: 20,
                refund_amount: null,
                remarks: null,
                cf_media_id: null,
                created_at: '2024-07-04T03:32:44.695Z',
                partial_paid_at: null,
                paid_at: '2024-07-04T03:32:44.000Z',
                failed_at: null,
                partial_refunded_at: null,
                refunded_at: null,
                settlement_at: null,
                updated_at: '2024-07-11T06:48:28.141Z',
              },
              {
                id: 7,
                transaction_type: 'debit',
                payment_status: 'paid',
                payment_by: 'customer',
                payment_for: 'rider',
                payment_id: 132,
                customer_id: 2,
                warehouse_id: null,
                rider_id: 3,
                order_id: 293,
                fare_amount: 30,
                gst: 3,
                tradebar_fee: 3,
                net_balance: null,
                payable_amount: null,
                settlement_amount: 20,
                refund_amount: null,
                remarks: null,
                cf_media_id: null,
                created_at: '2024-07-04T03:32:44.695Z',
                partial_paid_at: null,
                paid_at: '2024-07-04T03:32:44.000Z',
                failed_at: null,
                partial_refunded_at: null,
                refunded_at: null,
                settlement_at: null,
                updated_at: '2024-07-11T06:48:28.141Z',
              },
            ],
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async findAll(): Promise<any> {
    const paymentHistory = await this.userPaymentHistoryService.findAll();
    //   console.log('paymentHistory',paymentHistory);
    let total_balance = 0;
    // let debit_balance = 0;
    let last_settlement_amount = 0;

    paymentHistory.filter((item) => {
      if (item.transaction_type == 'credit') {
        total_balance += item.net_balance - item.tradebar_fee;
      }

      // if (item.transaction_type == 'debit') {
      //   debit_balance += item.settlement_amount;
      // }
    });

    const reversedArray = paymentHistory.reverse();
    reversedArray.find((item) => {
      if (item.transaction_type == 'debit') {
        last_settlement_amount = item.settlement_amount;
      }
    });

    const res_obj = {
      current_balance: total_balance,
      // debit_balance: debit_balance,
      last_settlement_amount: last_settlement_amount,
      payment_history: paymentHistory,
    };

    return {
      status: 'success',
      message: 'All Payment history has been fetched successfully',
      data: res_obj,
    };
  }

  @Get('earned-today')
  @ApiOperation({ summary: 'Todays earning history' })
  @ApiResponse({
    status: 200,
    description: 'Get todays earning history',
    content: {
      'application/json': {
        example: {
          message: 'Todays earning history fetched successfully',
          status: 'success',
          data: {
            total_trips: 7,
            total_distance: 5,
            total_earnings: 231,
            total_trip_time: 10,
          },
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  async earnedToday(): Promise<any> {
    const today_earnings =
      await this.userPaymentHistoryService.findTodaysEarning();

    return {
      status: 'success',
      message: 'Todays earning history fetched successfully',
      data: today_earnings,
    };
  }
}
