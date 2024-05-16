import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { CreateRiderDto } from '../dtos/create-riders.dto';
import { UpdateRidersDto } from '../dtos/update-riders.dto';
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
    updateRiderDto: UpdateRidersDto,
  ): Promise<{ data: Riders }> {
    const riderId = this.request['user'].id;
    const rider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Riders not found');
    }

    const queryPartsForSQL = [];
    const parametersForSQL = [];

    // Update rider fields if they are truthy in updateRiderDto
    if (updateRiderDto.first_name) {
      rider.first_name = updateRiderDto.first_name;

      queryPartsForSQL.push('first_name = ?');
      parametersForSQL.push(updateRiderDto.first_name);
    }
    if (updateRiderDto.last_name) {
      rider.last_name = updateRiderDto.last_name;

      queryPartsForSQL.push('last_name = ?');
      parametersForSQL.push(updateRiderDto.last_name);
    }
    if (updateRiderDto.phone) {
      rider.phone = updateRiderDto.phone;

      queryPartsForSQL.push('phone = ?');
      parametersForSQL.push(updateRiderDto.phone);
    }
    if (updateRiderDto.email) {
      rider.email = updateRiderDto.email;

      queryPartsForSQL.push('email = ?');
      parametersForSQL.push(updateRiderDto.email);
    }
    if (updateRiderDto.date_of_birth) {
      rider.date_of_birth = updateRiderDto.date_of_birth;
    }
    if (updateRiderDto.gender) {
      rider.gender = updateRiderDto.gender;
    }
    if (updateRiderDto.is_active !== undefined) {
      rider.is_active = updateRiderDto.is_active;
    }

    // Save the updated rider
    await this.ridersRepository.save(rider);

    // Update the users table based on the changes made to the riders table

    // const query = `
    //   UPDATE users
    //   SET first_name = ?, last_name = ?, email = ?, phone = ?
    //   WHERE id = ?
    // `;

    if (queryPartsForSQL.length !== 0) {
      const queryForSQL = `
      UPDATE users
      SET ${queryPartsForSQL.join(', ')}
      WHERE id = ?
    `;
      parametersForSQL.push(rider.user_id);

      await this.entityManager.query(queryForSQL, parametersForSQL);
    }

    // await this.ridersRepository.update(
    //   { id: riderId },
    //   updateRidersDto,
    // );

    const editedRider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });
    return { data: editedRider };
  }

  public async getRider(riderId: number): Promise<{ data: Riders }> {
    const rider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    return {
      data: rider,
    };
  }
}
