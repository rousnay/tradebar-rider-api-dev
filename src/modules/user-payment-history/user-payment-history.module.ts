import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserPaymentHistory } from './user-payment-history.entity';
import { UserPaymentHistoryController } from './user-payment-history.controller';
import { UserPaymentHistoryService } from './user-payment-history.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPaymentHistory]),
  ],
  controllers: [UserPaymentHistoryController],
  providers: [UserPaymentHistoryService],
  exports: [UserPaymentHistoryService]
})
export class UserPaymentHistoryModule {}
