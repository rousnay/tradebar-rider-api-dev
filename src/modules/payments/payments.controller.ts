import {
  Headers,
  Req,
  Res,
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { PaymentService } from './payments.service';

@Controller('payment')
@ApiTags('Payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @Put('update-payment-status')
  // @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (webhook)' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       stripe_id: {
  //         type: 'string',
  //         example:
  //           'cs_test_a1ZPTibt206umm3NxH9MSIPr4EL2LCcot5UVpgpwZNM0vYMiWjwdfn7h7I',
  //       },
  //       payment_status: { type: 'string', example: 'Paid' },
  //     },
  //   },
  // })
  // async updatePaymentStatus(
  //   @Body('stripe_id') stripe_id: string,
  //   @Body('payment_status') payment_status: string,
  // ): Promise<number> {
  //   return this.paymentService.updatePaymentStatus(
  //     stripe_id,
  //     payment_status,
  //     true,
  //   );
  // }
}
