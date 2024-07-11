import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
// import { CreateUserPaymentHistoryDto } from './dtos/create-user-payment-history.dto';
import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { UserPaymentHistory } from './user-payment-history.entity';
import { DeliveryRequest } from '@modules/delivery/schemas/delivery-request.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserPaymentHistoryService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(UserPaymentHistory)
    private readonly userPaymentHistoryRepository: Repository<UserPaymentHistory>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<UserPaymentHistory[]> {
    const rider_id = this.request['user'].id;
    let histories = this.userPaymentHistoryRepository.find({
      where: { rider_id: rider_id }
    });

    return histories;
  }

    async findTodaysEarning(): Promise<any> {
        const rider_id = this.request['user'].id;
        const result = await this.entityManager.query(
            'SELECT * from deliveries WHERE rider_id = ?',
            [rider_id],
        );

        let total_trips = result.length > 0 ? result.length : 0;
        let total_distance = 0;
        let total_earnings = 0;
        let total_trip_time = 0;

        result.filter(item => {
            total_distance += item.init_distance;
            total_earnings += item.delivery_charge;
            total_trip_time += item.init_duration;
        })      
        
        let hours = Math.trunc(70/60);
        let minutes = 70 % 60;
        // console.log(hours +":"+ minutes);

        return {
            total_trips:total_trips,
            total_distance:total_distance+" Km",
            total_earnings:total_earnings,
            total_trip_time:'Hour '+hours+", Minute "+minutes,
        };

        
    }

}
