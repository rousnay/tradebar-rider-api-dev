// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { CreateUserPaymentHistoryDto } from './create-user-payment-history.dto';

export class UpdateUserPaymentHistoryDto extends PartialType(
  CreateUserPaymentHistoryDto,
) {}
