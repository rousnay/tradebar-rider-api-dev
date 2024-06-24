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
import { DeliveryNotificationService } from './delivery.notification.service';

@Injectable()
export class DeliveryRequestService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectModel(DeliveryRequestNotificationModel.modelName)
    private deliveryRequestNotificationModel: Model<DeliveryRequestNotification>,
    private deliveryNotificationService: DeliveryNotificationService,
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
      accepted_at = ?,
      rider_id = ?,
      vehicle_id = ?
      WHERE id = ?
    `;



    const updateOrderQuery = `
      UPDATE orders
      SET order_status = ?,
      accepted_at = ?,
      WHERE id = ?
    `;

    try {
      await this.entityManager.query(updateShippingQuery, [
        ShippingStatus.ACCEPTED,
        new Date(),
        rider.id,
        selectedVehicleId,
        deliveryRequest.deliveryId,
      ]);
      console.log('ShippingStatus Update successful');

      await this.entityManager.query(updateOrderQuery, [
        'accepted',
        new Date(),
        deliveryRequest.orderId,
      ]);

      console.log('OrderStatus Update successful');
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }

    //sent notifications
    await this.deliveryNotificationService.sendDeliveryStatusNotification(
      deliveryRequest,
      ShippingStatus.ACCEPTED,
    );

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
    // console.log('Rider #:', rider);

    const updateFields = {
      status: status,
    };

    const theDate = new Date();
    let timestampField = '';

    if (status === ShippingStatus.ACCEPTED) {
      timestampField = 'accepted_at';
    } else if (status === ShippingStatus.REACHED_AT_PICKUP_POINT) {
      timestampField = 'reached_pickup_point_at';
    } else if (status === ShippingStatus.PICKED_UP) {
      timestampField = 'picked_up_at';
    } else if (status === ShippingStatus.REACHED_AT_DELIVERY_POINT) {
      timestampField = 'reached_delivery_point_at';
    } else if (status === ShippingStatus.DELIVERED) {
      timestampField = 'delivered_at';
    } else if (status === ShippingStatus.CANCELLED) {
      timestampField = 'cancelled_at';
    }

    let updateShippingQuery = `
      UPDATE deliveries
      SET shipping_status = ?
    `;

    const queryParams: (ShippingStatus | Date | number)[] = [status];

    if (timestampField) {
      updateShippingQuery += `, ${timestampField} = ?`;
      queryParams.push(theDate);
    }

    updateShippingQuery += ' WHERE id = ? AND rider_id = ?';
    queryParams.push(deliveryRequest.deliveryId, rider.id);

    console.log('updateShippingQuery', updateShippingQuery);
    console.log('queryParams', queryParams);

    try {
      await this.entityManager.query(updateShippingQuery, queryParams);

      console.log('ShippingStatus Update successful');
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }

    //sent notifications
    await this.deliveryNotificationService.sendDeliveryStatusNotification(
      deliveryRequest,
      status,
    );

    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();
  }
}
