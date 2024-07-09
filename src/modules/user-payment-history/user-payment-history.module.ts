import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPaymentHistory } from './user-payment-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPaymentHistory])],
})
export class UserPaymentHistoryModule {}
