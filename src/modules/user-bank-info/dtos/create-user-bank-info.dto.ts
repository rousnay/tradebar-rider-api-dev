import { ApiProperty } from '@nestjs/swagger';

export class CreateUserBankInfoDto {
  // @ApiProperty({ required: false, description: 'Customer ID' })
  // customer_id?: number;

  // @ApiProperty({ required: false, description: 'Warehouse ID' })
  // warehouse_id?: number;

  // @ApiProperty({ required: false, description: 'Rider ID' })
  // rider_id?: number;

  @ApiProperty({ description: 'Bank Name' })
  bank_name: string;

  @ApiProperty({ description: 'Account Number' })
  account_number: string;

  @ApiProperty({ description: 'Account Holder Name' })
  account_holder_name: string;

  @ApiProperty({ description: 'BSB (Bank State Branch)' })
  bsb: string;

  @ApiProperty({
    required: false,
    default: false,
    description: 'Is Default Account',
  })
  is_default?: boolean;
}
