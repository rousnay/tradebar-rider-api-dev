import { ApiProperty } from '@nestjs/swagger';

import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import {
  PaymentStatus,
  PaymentTransactionType,
} from '@common/enums/payment.enum';
import { UserType } from '@common/enums/user.enum';

export class CreateUserPaymentHistoryDto {
  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  id?: number;

  @ApiProperty({ enum: PaymentTransactionType, required: false })
  @IsEnum(PaymentTransactionType)
  @IsOptional()
  transaction_type?: PaymentTransactionType;

  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsEnum(PaymentStatus)
  @IsOptional()
  payment_status?: PaymentStatus;

  @ApiProperty({ enum: UserType, required: false })
  @IsEnum(UserType)
  @IsOptional()
  payment_by?: UserType;

  @ApiProperty({ enum: UserType, required: false })
  @IsEnum(UserType)
  @IsOptional()
  payment_for?: UserType;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  payment_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  customer_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  warehouse_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  rider_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  order_id?: number;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  tradebar_fee_id?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  payable_amount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  fare_amount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  gst?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  tradebar_fee?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  net_balance?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  settlement_amount?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  refund_amount?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  cf_media_id?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  partial_paid_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  paid_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  failed_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  partial_refunded_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  refunded_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  settlement_at?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  updated_at?: Date;
}
