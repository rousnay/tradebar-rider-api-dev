import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserBankInfo } from './user-bank-info.entity';
import { CreateUserBankInfoDto } from './dtos/create-user-bank-info.dto';
import { UpdateUserBankInfoDto } from './dtos/update-user-bank-info.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class UserBankInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(UserBankInfo)
    private readonly userBankInfoRepository: Repository<UserBankInfo>,
  ) {}

  async create(
    createUserBankInfoDto: CreateUserBankInfoDto,
  ): Promise<UserBankInfo> {
    const rider_id = this.request['user'].id;

    const bankInfo = await this.userBankInfoRepository.save({
      ...createUserBankInfoDto,
      rider_id,
    });

    if (bankInfo?.is_default === true) {
      await this.userBankInfoRepository.update(
        {
          rider_id,
          id: Not(bankInfo?.id), // Exclude the current address
        },
        { is_default: false },
      );
    }

    return bankInfo;
  }

  async findAll(): Promise<UserBankInfo[]> {
    const rider_id = this.request['user'].id;
    return this.userBankInfoRepository.find({
      where: { rider_id: rider_id },
    });
  }

  async findOne(id: number): Promise<UserBankInfo> {
    const rider_id = this.request['user'].id;
    return this.userBankInfoRepository.findOne({ where: { id, rider_id } });
  }

  async update(
    id: number,
    updateUserBankInfoDto: UpdateUserBankInfoDto,
  ): Promise<UserBankInfo> {
    const rider_id = this.request['user'].id;

    const bankInfo = await this.userBankInfoRepository.findOne({
      where: { id, rider_id },
    });

    if (!bankInfo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bank info not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedBankInfo = await this.userBankInfoRepository.save({
      ...bankInfo,
      ...updateUserBankInfoDto,
    });

    if (updatedBankInfo?.is_default === true) {
      await this.userBankInfoRepository.update(
        {
          rider_id,
          id: Not(updatedBankInfo?.id), // Exclude the current address
        },
        { is_default: false },
      );
    }

    return updatedBankInfo;
  }

  async setDefaultBankById(id: number): Promise<UserBankInfo> {
    const rider_id = this.request['user'].id;

    const bankInfo = await this.userBankInfoRepository.findOne({
      where: { id, rider_id },
    });

    if (!bankInfo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Bank info not found',
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Update all addresses of the customer to set is_default to false
    await this.userBankInfoRepository.update(
      {
        rider_id,
        id: Not(id), // Exclude the current address
      },
      { is_default: false },
    );

    // Set the selected address as default
    bankInfo.is_default = true;
    return this.userBankInfoRepository.save(bankInfo);
  }

  async remove(id: number): Promise<void> {
    await this.userBankInfoRepository.delete(id);
  }

  //   async findByUser(userType: string, userId: number): Promise<UserBankInfo[]> {
  //     const whereClause = {};
  //     whereClause[`${userType}_id`] = userId;
  //     return this.userBankInfoRepository.find({ where: whereClause });
  //   }
}
