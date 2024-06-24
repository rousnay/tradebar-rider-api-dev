import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as Sentry from '@sentry/node';

import { UpdateRiderDto } from '../dtos/update-riders.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { Riders } from '../entities/riders.entity';

@Injectable()
export class RidersService {
  logger: any;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private jwtService: JwtService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Riders)
    private ridersRepository: Repository<Riders>,
  ) {}

  public async getRiders({
    page = 1,
    limit = 10,
    ...filters
  }): Promise<ApiResponseDto<Riders[]>> {
    const offset = (page - 1) * limit;

    const riders = await this.ridersRepository.find({
      where: filters,
      skip: offset,
      take: limit,
    });

    const totalCount = await this.ridersRepository.count();

    // throw new NotFoundException('Riders not found');

    return {
      message: 'Riders fetched successfully',
      status: 'success',
      totalCount,
      currentPage: page,
      currentLimit: limit,
      data: riders,
    };
  }

  public async getLoggedInRiderProfile(): Promise<{ data: Riders }> {
    try {
      const rider = this.request['user'];
      return {
        data: rider,
      };
    } catch (error) {
      throw new Error(`Error fetching riders: ${error.message}`);
    }
  }

  public async editRiderProfile(
    updateRiderDto: UpdateRiderDto,
  ): Promise<{ data: any }> {
    const riderId = this.request['user'].id;
    const rider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    // Update the rider's profile directly in the database
    await this.ridersRepository.update({ id: riderId }, updateRiderDto);

    // Fetch the updated rider profile
    const updatedRider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    return {
      data: updatedRider,
    };
  }

  public async getRiderById(riderId: number): Promise<{ data: Riders }> {
    const rider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Riders not found');
    }

    // Sentry.getCurrentScope().setTransactionName('UserListView 22');

    return {
      data: rider,
    };
  }

  async getAccountApprovalStatus(): Promise<{
    data: {
      is_approved: any;
    };
  }> {
    const rider = await this.ridersRepository.findOne({
      where: { id: this.request['user'].id },
    });
    console.log(rider);
    return {
      data: {
        is_approved: rider.is_approved,
      },
    };
  }
}
