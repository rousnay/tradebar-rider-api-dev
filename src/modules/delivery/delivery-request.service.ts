import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliveryRequest } from './schemas/delivery-request.schema';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { REQUEST } from '@nestjs/core';
import {
  DeliveryRequestNotification,
  DeliveryRequestNotificationModel,
} from '@modules/notification/notification.schema';

@Injectable()
export class DeliveryRequestService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectModel(DeliveryRequestNotificationModel.modelName)
    private deliveryRequestNotificationModel: Model<DeliveryRequestNotification>,
  ) {}

  async findAll(): Promise<DeliveryRequest[]> {
    const userId = this.request['user'].user_id;
    const notifications = await this.deliveryRequestNotificationModel
      .find({ userId })
      .exec();

    const requestIds = notifications.map(
      (notification) => notification?.data?.requestId,
    );

    return this.deliveryRequestModel.find({ _id: { $in: requestIds } }).exec();
  }

  async findOne(id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestModel.findById(id).exec();
  }

  async acceptDeliveryRequest(
    req: any,
    id: string,
    vehicleId: number,
  ): Promise<DeliveryRequest> {
    const selectedVehicleId = Number(vehicleId || 0);

    const deliveryRequest = await this.deliveryRequestModel.findById(id).exec();
    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    // if (deliveryRequest.status !== DeliveryStatus.SEARCHING) {
    //   throw new BadRequestException(
    //     'Delivery request is not in searching status',
    //   );
    // }

    const rider = req.user;
    console.log('Rider #:', rider);

    const updateFields = {
      status: ShippingStatus.ACCEPTED,
      assignedRider: {
        id: rider.id,
        name: `${rider.first_name} ${rider.last_name}`,
        vehicleId: selectedVehicleId,
      },
    };

    const updateShippingQuery = `
      UPDATE deliveries
      SET shipping_status = ?,
          rider_id = ?,
          vehicle_id = ?
      WHERE id = ?
    `;

    try {
      await this.entityManager.query(updateShippingQuery, [
        ShippingStatus.ACCEPTED,
        rider.id,
        selectedVehicleId,
        deliveryRequest.deliveryId,
      ]);

      console.log('ShippingStatus Update successful');
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }

    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();
  }

  async updateDeliveryRequestStatus(
    req: any,
    id: string,
    status: ShippingStatus,
  ): Promise<DeliveryRequest> {
    const deliveryRequest = await this.deliveryRequestModel.findById(id).exec();
    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    const rider = req.user;
    console.log('Rider #:', rider);

    const updateFields = {
      status: status,
    };

    const updateShippingQuery = `
      UPDATE deliveries
      SET shipping_status = ?
      WHERE id = ?
    `;

    try {
      await this.entityManager.query(updateShippingQuery, [
        status,
        deliveryRequest.deliveryId,
      ]);

      console.log('ShippingStatus Update successful');
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }

    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();
  }
}
