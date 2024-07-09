import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async acceptDeliveryRequest(req: any, id: string): Promise<DeliveryRequest> {
    const rider = req.user;
    console.log('Rider #:', rider);

    const selectedVehicleId = req.user?.active_vehicle_id;

    const updateFields = {
      status: ShippingStatus.ACCEPTED,
      assignedRider: {
        id: rider.id,
        name: `${rider.first_name} ${rider.last_name}`,
        vehicleId: selectedVehicleId,
      },
      acceptedAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedDeliveryRequest = await this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();

    console.log('updatedDeliveryRequest:', updatedDeliveryRequest);

    if (!updatedDeliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    // if (deliveryRequest.status === 'accepted') {
    //   if (deliveryRequest?.assignedRider?.id === rider.id) {
    //     throw new BadRequestException(
    //       'You have already accepted this delivery request',
    //     );
    //   } else {
    //     throw new BadRequestException(
    //       'Delivery request has been accepted by another rider',
    //     );
    //   }
    // } else if (deliveryRequest.status !== 'searching') {
    //   throw new BadRequestException(
    //     'Delivery request is not in searching mode',
    //   );
    // }

    const updateDeliveryQuery = `
      UPDATE deliveries
      SET shipping_status = ?,
        accepted_at = ?,
        rider_id = ?,
        vehicle_id = ?
      WHERE id = ?
    `;

    const updateOrderQuery = `
      UPDATE orders
      SET order_status = 'accepted',
        accepted_at = ?
      WHERE id = (SELECT order_id FROM deliveries WHERE id = ?)
    `;

    try {
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.query(updateDeliveryQuery, [
            ShippingStatus.ACCEPTED,
            new Date(),
            rider.id,
            selectedVehicleId,
            updatedDeliveryRequest.deliveryId,
          ]);

          await transactionalEntityManager.query(updateOrderQuery, [
            new Date(),
            updatedDeliveryRequest.deliveryId,
          ]);
        },
      );

      // await this.entityManager.query(updateShippingQuery, [
      //   ShippingStatus.ACCEPTED,
      //   new Date(),
      //   rider.id,
      //   selectedVehicleId,
      //   deliveryRequest.deliveryId,
      // ]);
      // console.log('ShippingStatus Update successful');

      // await transactionalEntityManager.query(updateOrderQuery, [
      //   deliveryRequest.deliveryId,
      // ]);

      console.log('ShippingStatus: accepted Update successful');
    } catch (error) {
      console.error('Error updating shipping status:', error);
    }

    //sent notifications
    const notificationSentToDeviceTokens =
      await this.deliveryNotificationService.sendDeliveryStatusNotification(
        updatedDeliveryRequest,
        ShippingStatus.ACCEPTED,
      );

    console.log(
      'Delivery Status - ACCEPTED, notificationSentToDeviceTokens',
      JSON.stringify(notificationSentToDeviceTokens, null, 2),
    );

    return updatedDeliveryRequest;
  }

  async updateDeliveryRequestStatus(
    req: any,
    id: string,
    status: ShippingStatus,
  ): Promise<DeliveryRequest> {
    // const deliveryRequest = await this.deliveryRequestModel.findById(id).exec();

    const updateFields = {
      status: status,
      updatedAt: new Date(),
    };

    if (status === ShippingStatus.CANCELLED) {
      updateFields['cancelledAt'] = new Date();
    }

    const updatedDeliveryRequest = await this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();

    if (!updatedDeliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    const rider = req.user;
    // console.log('Rider #:', rider);

    const theDate = new Date();
    let timestampField = '';
    let orderStatus = '';
    let orderAcceptedDate: Date | null = null;
    let orderCancelledDate: Date | null = null;

    if (status === ShippingStatus.ACCEPTED) {
      timestampField = 'accepted_at';
      orderStatus = 'accepted';
      orderAcceptedDate = theDate;
    } else if (status === ShippingStatus.REACHED_AT_PICKUP_POINT) {
      timestampField = 'reached_pickup_point_at';
      orderStatus = 'processing';
    } else if (status === ShippingStatus.PICKED_UP) {
      timestampField = 'picked_up_at';
      orderStatus = 'in_transit';
    } else if (status === ShippingStatus.REACHED_AT_DELIVERY_POINT) {
      timestampField = 'reached_delivery_point_at';
    } else if (status === ShippingStatus.DELIVERED) {
      timestampField = 'delivered_at';
      orderStatus = 'delivered';
    } else if (status === ShippingStatus.CANCELLED) {
      timestampField = 'cancelled_at';
      orderStatus = 'cancelled';
      orderCancelledDate = theDate;
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
    queryParams.push(updatedDeliveryRequest.deliveryId, rider.id);

    // Construct the updateOrderQuery based on the presence of accepted_at and cancelled_at
    let updateOrderQuery = `
      UPDATE orders
      SET order_status = ?
    `;
    const orderQueryParams: (string | Date | number)[] = [orderStatus];

    if (orderAcceptedDate) {
      updateOrderQuery += `, accepted_at = ?`;
      orderQueryParams.push(orderAcceptedDate);
    }

    if (orderCancelledDate) {
      updateOrderQuery += `, cancelled_at = ?`;
      orderQueryParams.push(orderCancelledDate);
    }

    updateOrderQuery += ` WHERE id = (SELECT order_id FROM deliveries WHERE id = ?)`;
    orderQueryParams.push(updatedDeliveryRequest.deliveryId);

    // console.log('updateShippingQuery', updateShippingQuery);
    // console.log('queryParams', queryParams);
    // console.log('updateOrderQuery', updateOrderQuery);
    // console.log('orderQueryParams', orderQueryParams);

    try {
      await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.query(
            updateShippingQuery,
            queryParams,
          );

          if (orderStatus) {
            await transactionalEntityManager.query(
              updateOrderQuery,
              orderQueryParams,
            );
          }
        },
      );

      console.log(
        'ShippingStatus and OrderStatus: ' + status + ' Update successful',
      );
      //sent notifications
      const notificationSentToDeviceTokens =
        await this.deliveryNotificationService.sendDeliveryStatusNotification(
          updatedDeliveryRequest,
          status,
        );

      console.log(
        'Delivery Status - ACCEPTED, notificationSentToDeviceTokens',
        JSON.stringify(notificationSentToDeviceTokens, null, 2),
      );
    } catch (error) {
      console.error('Error updating statuses:', error);
    }

    return updatedDeliveryRequest;
  }
}
