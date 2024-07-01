import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBankInfoService } from './user-bank-info.service';
import { UserBankInfoController } from './user-bank-info.controller';
import { UserBankInfo } from './user-bank-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBankInfo])],
  controllers: [UserBankInfoController],
  providers: [UserBankInfoService],
  exports: [UserBankInfoService],
})
export class UserBankInfoModule {}
