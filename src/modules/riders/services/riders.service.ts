import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import * as Sentry from '@sentry/node';

import { AppConstants } from '@common/constants/constants';
import { UpdateRiderDto } from '../dtos/update-riders.dto';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { Riders } from '../entities/riders.entity';
import { MailService } from '@services/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryRequest } from '@modules/delivery/schemas/delivery-request.schema';
import { Model } from 'mongoose';

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
    private readonly mailService: MailService,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
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
      const ongoing_trip = await this.getRiderOnGoingTrip(rider.id);

      // Update the rider's profile directly in the database
      return {
        data: {
          ...rider,
          ongoing_trip,
        },
      };
    } catch (error) {
      throw new Error(`Error fetching riders: ${error.message}`);
    }
  }

  public async getRiderOnGoingTrip(riderId: any): Promise<{ data: any }> {
    let ongoing_trip = null;
    // find deliver id and order id for find ongoing trip
    const deliveriesData = await this.entityManager.query(
      'SELECT id,order_id,shipping_status FROM deliveries WHERE rider_id = ? AND shipping_status IN ("accepted","reached_at_pickup_point","picked_up","reached_at_delivery_point")',
      [riderId],
    );

    if (deliveriesData.length > 0) {
      // find deliver request id
      const deliverRequestData = await this.deliveryRequestModel.find(
        {
          orderId: deliveriesData[0].order_id,
          deliveryId: deliveriesData[0].id,
        },
        {
          select: ['_id'],
        },
      );
      ongoing_trip = {
        order_id: deliveriesData[0].order_id || null,
        delivery_id: deliveriesData[0].id || null,
        shipping_status: deliveriesData[0].shipping_status || null,
        delivery_request_id:
          deliverRequestData.length > 0 ? deliverRequestData[0]._id : null,
      };
      return ongoing_trip;
    } else {
      return null;
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

    const { driving_license_number, ...modifiedUpdatedRiderDto } =
      updateRiderDto;

    // Update the rider's profile directly in the database
    await this.ridersRepository.update(
      { id: riderId },
      modifiedUpdatedRiderDto,
    );

    // Fetch the updated rider profile
    const updatedRider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });

    if (driving_license_number) {
      console.log('driving_license_number:', driving_license_number);

      await this.mailService.sendMail(
        AppConstants.mail.recipient, // Replace with your recipient email address
        'Driving License Number of Rider: ' + updatedRider.id,
        'Driving License Number: ' + driving_license_number,
        `
      <h3>Profile Information</h3>
      <p><strong> Rider Name: </strong> ${
        updatedRider.first_name + ' ' + updatedRider.last_name
      }</p>
      <p><strong> Rider Id: </strong> ${updatedRider.id}</p>
      <p><strong> Driving License Number: </strong> ${driving_license_number}</p>
      `,
      );
    }

    return {
      data: { ...updatedRider, driving_license_number },
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
    const riderId = this.request['user'].id;
    console.log(riderId);
    const rider = await this.ridersRepository.findOne({
      where: { id: riderId },
    });
    return {
      data: {
        is_approved: rider.is_approved,
      },
    };
  }

  async removeRider(): Promise<void> {
    const userId = this.request['user'].user_id;
    // Find the customer
    const rider = await this.ridersRepository.findOne({
      where: { user_id: userId },
    });

    if (!rider) {
      throw new NotFoundException(`Rider with user_id ${userId} not found`);
    }

    // Query the users table directly using EntityManager
    const user = await this.entityManager.query(
      'SELECT * FROM users WHERE id = ?',
      [userId],
    );

    if (!user || user.length === 0) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Transfer data to user_deleted table using EntityManager
    await this.entityManager.query(
      `INSERT INTO user_deleted (user_id, first_name, last_name, phone, email, password, user_type, date_of_birth, gender, profile_image_cf_media_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rider.user_id,
        rider.first_name,
        rider.last_name,
        rider.phone,
        rider.email,
        user[0].password, // Get password from users table
        user[0].user_type, // Get user_type from users table
        rider.date_of_birth,
        rider.gender,
        rider.profile_image_cf_media_id,
      ],
    );

    // Nullify sensitive data in riders table
    rider.first_name = null;
    rider.last_name = null;
    rider.phone = null;
    rider.email = null;
    rider.date_of_birth = null;
    rider.gender = null;
    rider.is_active = false;
    rider.profile_image_cf_media_id = null;
    rider.deleted_at = new Date();
    await this.ridersRepository.save(rider);

    // Nullify sensitive data in users table using EntityManager
    await this.entityManager.query(
      `UPDATE users
       SET name = NULL, first_name = NULL, last_name = NULL, email = NULL, phone = NULL, password = NULL, active = 0
       WHERE id = ?`,
      [userId],
    );

    console.log('Removed rider with user_id', userId);
  }
}
