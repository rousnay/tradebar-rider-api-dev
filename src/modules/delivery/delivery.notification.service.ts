import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NotificationService } from '@modules/notification/notification.service';
import { REQUEST } from '@nestjs/core';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class DeliveryNotificationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly notificationService: NotificationService,
  ) {}

  async getUserDeviceTokensByWarehouseId(
    modelId: number,
  ): Promise<{ userId: number; tokens: string[] }[]> {
    const rawQuery = `
        SELECT u.id as userId, GROUP_CONCAT(udt.device_token SEPARATOR ',') as tokens
            FROM users u
            INNER JOIN user_device_tokens udt ON u.id = udt.user_id
            WHERE u.model_id = ? AND u.user_type = 'warehouse_owner'
            GROUP BY u.id;
        `;

    const result = await this.entityManager.query(rawQuery, [modelId]);

    if (result.length === 0) {
      return null;
    }

    return result.map((row) => ({
      userId: row.userId,
      tokens: row.tokens ? row.tokens.split(',') : [],
    }));
  }

  async getUserDeviceTokensByCustomerId(
    customerId: number,
  ): Promise<{ userId: number; tokens: string[] }[]> {
    const rawQuery = `
        SELECT u.id AS userId, GROUP_CONCAT(udt.device_token SEPARATOR ',') as tokens
            FROM customers c
            INNER JOIN users u ON c.user_id = u.id
            LEFT JOIN user_device_tokens udt ON udt.user_id = u.id
            WHERE c.id = ?
            GROUP BY u.id;
        `;

    const result = await this.entityManager.query(rawQuery, [customerId]);

    if (result.length === 0) {
      return null;
    }

    return result.map((row) => ({
      userId: row.userId,
      tokens: row.tokens ? row.tokens.split(',') : [],
    }));
  }

  async sendDeliveryStatusNotification(
    deliveryRequest: any,
    status: string,
  ): Promise<any> {
    const statusMessages: { [key in ShippingStatus]: string } = {
      [ShippingStatus.WAITING]: 'The order is waiting for a rider.',
      [ShippingStatus.SEARCHING]:
        'A rider is being searched to accept the delivery request.',
      [ShippingStatus.ACCEPTED]:
        'Your delivery request has been accepted by rider' +
        deliveryRequest?.assignedRider?.name +
        '.',
      [ShippingStatus.REACHED_AT_PICKUP_POINT]:
        'Rider ' +
        deliveryRequest?.assignedRider?.name +
        'has arrived at the pickup point.',
      [ShippingStatus.PICKED_UP]:
        'The order has been picked up by ' +
        deliveryRequest?.assignedRider?.name +
        '.',
      [ShippingStatus.REACHED_AT_DELIVERY_POINT]:
        'Rider ' +
        deliveryRequest?.assignedRider?.name +
        ' has reached the delivery point.',
      [ShippingStatus.DELIVERED]:
        'The order has been delivered by ' +
        deliveryRequest?.assignedRider?.name +
        '.',
      [ShippingStatus.EXPIRED]: 'Your delivery request has been expired.',
      [ShippingStatus.CANCELLED]: 'Your delivery request has been cancelled.',
    };

    const title = 'Delivery status update';
    const message =
      statusMessages[status] || 'The delivery status has changed.';

    const data = {
      type: 'delivery',
      orderId: deliveryRequest?.orderId.toString(),
      deliveryId: deliveryRequest?.deliveryId.toString(),
      deliveryUserId: deliveryRequest?.assignedRider?.id.toString(),
      deliveryUserName: deliveryRequest?.assignedRider?.name,
    };

    let customerId = null;
    let warehouseId = null;
    let userDeviceTokens = [];

    if (deliveryRequest?.orderType === 'transportation_only') {
      customerId = deliveryRequest?.dropOffLocation?.customer_id;
      data['target'] = 'customer';
      data['customerId'] = customerId.toString();

      userDeviceTokens = await this.getUserDeviceTokensByCustomerId(customerId);

      for (const customer of userDeviceTokens) {
        await this.notificationService.sendAndStoreNotification(
          customer.userId,
          customer.tokens,
          title,
          message,
          { ...data },
        );
      }
    } else if (deliveryRequest?.orderType === 'warehouse_transportation') {
      warehouseId = deliveryRequest?.pickupLocation?.warehouse_id;
      data['target'] = 'warehouse';
      data['warehouseId'] = warehouseId.toString();
      data['url'] =
        AppConstants.appServices.warehouseBaseUrl +
        '/deliveries/' +
        deliveryRequest?.deliveryId;

      userDeviceTokens = await this.getUserDeviceTokensByWarehouseId(
        warehouseId,
      );

      for (const warehouse of userDeviceTokens) {
        await this.notificationService.sendAndStoreNotification(
          warehouse.userId,
          warehouse.tokens,
          title,
          message,
          { ...data },
        );
      }
    } else {
      customerId = deliveryRequest?.dropOffLocation?.customer_id;
      data['target'] = 'customer';
      data['customerId'] = customerId.toString();

      const customerDeviceTokens = await this.getUserDeviceTokensByCustomerId(
        customerId,
      );

      for (const customer of customerDeviceTokens) {
        await this.notificationService.sendAndStoreNotification(
          customer.userId,
          customer.tokens,
          title,
          message,
          { ...data },
        );
      }

      warehouseId = deliveryRequest?.pickupLocation?.warehouse_id;
      data['target'] = 'warehouse';
      data['warehouseId'] = warehouseId.toString();
      data['url'] =
        AppConstants.appServices.warehouseBaseUrl +
        '/deliveries/' +
        deliveryRequest?.deliveryId;

      const warehouseDeviceTokens = await this.getUserDeviceTokensByWarehouseId(
        warehouseId,
      );

      for (const warehouse of warehouseDeviceTokens) {
        console.log('warehouse', warehouse);
        await this.notificationService.sendAndStoreNotification(
          warehouse.userId,
          warehouse.tokens,
          title,
          message,
          { ...data },
        );
      }

      userDeviceTokens = customerDeviceTokens.concat(warehouseDeviceTokens);
    }

    console.log('customerId', customerId);
    console.log('warehouseId', warehouseId);
    console.log('userDeviceTokens', userDeviceTokens);
    return {
      customerId,
      warehouseId,
      userDeviceTokens,
    };
  }
}
