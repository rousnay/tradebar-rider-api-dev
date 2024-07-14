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
import { RetrievePaymentMethodDto } from '../dtos/retrieve-payment-method.dto';
import { PaymentService } from '../services/payments.service';

@Controller('payment')
@ApiTags('Payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Put('update-payment-status')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend (webhook)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stripe_id: {
          type: 'string',
          example:
            'cs_test_a1ZPTibt206umm3NxH9MSIPr4EL2LCcot5UVpgpwZNM0vYMiWjwdfn7h7I',
        },
        payment_status: { type: 'string', example: 'Paid' },
      },
    },
  })
  async updatePaymentStatus(
    @Body('stripe_id') stripe_id: string,
    @Body('payment_status') payment_status: string,
  ): Promise<number> {
    return this.paymentService.updatePaymentStatus(
      stripe_id,
      payment_status,
      true,
    );
  }

  @Put('send-transportation-request/:stripe_id')
  @ApiOperation({ summary: 'PLEASE IGNORE! Only for backend' })
  async requestTransportation(
    @Param('stripe_id') stripe_id: string,
  ): Promise<number> {
    return this.paymentService.updatePaymentStatus(stripe_id, 'Paid', true);
  }
}
