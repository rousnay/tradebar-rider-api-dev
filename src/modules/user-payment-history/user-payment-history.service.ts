import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
// import { CreateUserPaymentHistoryDto } from './dtos/create-user-payment-history.dto';
import { REQUEST } from '@nestjs/core';
import { UserPaymentHistory } from './user-payment-history.entity';

@Injectable()
export class UserPaymentHistoryService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(UserPaymentHistory)
    private readonly userPaymentHistoryRepository: Repository<UserPaymentHistory>,
  ) {}

  async findAll(): Promise<UserPaymentHistory[]> {
    const rider_id = this.request['user'].id;
    return this.userPaymentHistoryRepository.find({
      where: { rider_id: rider_id }
    });
  }

}
