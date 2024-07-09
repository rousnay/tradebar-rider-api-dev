import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPaymentHistory{
    @ApiProperty({ description: 'Rider' })
    rider_id: number;

    @ApiProperty({ description: 'Net Balance' })
    net_balance: string;

    @ApiProperty({ description: 'Payable Amount' })
    payable_amount: string;
}