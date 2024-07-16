import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';

import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';
import { DeliveryService } from '@modules/delivery/delivery.service';
import { NotificationService } from '@modules/notification/notification.service'; // TODO: Remove this service
import { DeliveryRequestService } from '@modules/delivery/delivery-request.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly deliveryService: DeliveryService,
    private readonly notificationService: NotificationService,
    private deliveryRequestService: DeliveryRequestService,
  ) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: AppConstants.stripe.apiVersion,
    });
  }

  // async makePayment(
  //   userId: number,
  //   orderId: number,
  //   stripeId: string,
  //   deliveryCost: number,
  // ): Promise<{
  //   status: string;
  //   message: string;
  //   data: Stripe.PaymentIntent | null;
  // }> {
  //   console.log('makePayment called');
  //   console.log('userId', userId, 'orderId', orderId, 'stripeId', stripeId);

  //   try {
  //     const customer = await this.stripe.customers.retrieve(stripeId);

  //     if ((customer as Stripe.DeletedCustomer).deleted) {
  //       return {
  //         status: 'error',
  //         message: 'Customer has been deleted',
  //         data: null,
  //       };
  //     }

  //     const activeCustomer = customer as Stripe.Customer;

  //     const defaultPaymentMethod =
  //       activeCustomer.invoice_settings.default_payment_method;
  //     if (!defaultPaymentMethod) {
  //       return {
  //         status: 'error',
  //         message: 'No default payment method set',
  //         data: null,
  //       };
  //     }

  //     const paymentIntent = await this.stripe.paymentIntents.create({
  //       amount: deliveryCost * 100,
  //       currency: 'aud',
  //       customer: stripeId,
  //       payment_method: defaultPaymentMethod as string,
  //       off_session: true,
  //       confirm: true,
  //     });

  //     //Update payment status
  //     await this.updatePaymentStatus(userId, orderId, paymentIntent.id, 'Paid');

  //     return {
  //       status: 'success',
  //       message: 'Charge successful',
  //       data: paymentIntent,
  //     };
  //   } catch (error) {
  //     return {
  //       status: 'error',
  //       message: error.message,
  //       data: null,
  //     };
  //   }
  // }

  // async updatePaymentStatus(
  //   userId: number,
  //   orderId: number,
  //   stripe_id: string,
  //   payment_status: string,
  // ): Promise<any> {
  //   try {
  //     console.log('updatePaymentStatus called');
  //     console.log(
  //       'userId',
  //       userId,
  //       'orderId',
  //       orderId,
  //       'stripe_id',
  //       stripe_id,
  //       'payment_status',
  //       payment_status,
  //     );
  //     // const updateResult = await this.entityManager;
  //     await this.entityManager
  //       .createQueryBuilder()
  //       .update('payments')
  //       .set({ payment_status })
  //       .set({ stripe_id })
  //       .andWhere('payment_status != :payment_status', { payment_status })
  //       .execute();

  //     if (payment_status === 'Paid') {
  //       const payment = await this.entityManager
  //         .createQueryBuilder()
  //         .select('*')
  //         .from('payments', 'p')
  //         .where('p.stripe_id = :stripe_id', {
  //           stripe_id,
  //         })
  //         .getRawOne();

  //       if (payment) {
  //         console.log('updatePaymentStatus after PAID operated successfully');
  //         // const riderDeviceTokens =
  //         //   await this.deliveryService.sendDeliveryRequest(stripe_id);

  //         // const buildDeliveryRequestPayload =
  //         //   await this.deliveryRequestService.getDeliveryRequestPayloadByStripeId(
  //         //     stripe_id,
  //         //   );

  //         // const getDeliveryRequestData =
  //         //   await this.deliveryRequestService.create(
  //         //     buildDeliveryRequestPayload,
  //         //   );

  //         //NEED TO CHANGE DELIVERY STATUS TO SEARCHING...

  //         // const riderDeviceTokens = [];
  //         // const getDeliveryRequestData = null;

  //         // const requestedByUserId = getDeliveryRequestData?.requestFrom?.id;
  //         // const requestedByUserName = getDeliveryRequestData?.requestFrom?.name;
  //         // const requestId = getDeliveryRequestData?.id;
  //         // const title = 'New Delivery Request';
  //         // const message =
  //         //   'You have a new delivery request from ' + requestedByUserName;
  //         // const data = {
  //         //   target: 'rider',
  //         //   type: 'delivery_request',
  //         //   requestId: requestId,
  //         //   requestedByUserId: requestedByUserId.toString(),
  //         //   requestedByUserName: requestedByUserName,
  //         // };

  //         // for (const rider of riderDeviceTokens) {
  //         //   console.log('rider', rider);
  //         //   for (const deviceToken of rider.deviceTokens) {
  //         //     await this.notificationService.sendAndStoreDeliveryRequestNotification(
  //         //       rider.userId,
  //         //       deviceToken,
  //         //       title,
  //         //       message,
  //         //       { ...data, riderId: rider.riderId.toString() },
  //         //     );
  //         //   }
  //         // }

  //         return payment;
  //       }
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error('Payment not found or update failed');
  //   }
  // }
}
