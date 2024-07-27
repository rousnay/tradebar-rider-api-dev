import { REQUEST } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import Stripe from 'stripe';

import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';
import { NotificationService } from '@modules/notification/notification.service';
import { OrderType } from '@common/enums/order.enum';
import {
  PaymentStatus,
  PaymentTransactionType,
} from '@common/enums/payment.enum';
import { UserType } from '@common/enums/user.enum';
import { UserPaymentHistoryService } from '@modules/user-payment-history/user-payment-history.service';
import { CreateUserPaymentHistoryForDeliveryDto } from '@modules/user-payment-history/dtos/create-user-payment-history-for-delivery.dto';
import { AppVariables } from '@common/utils/variables';

@Injectable()
export class DeliveryPaymentService {
  private stripe: Stripe;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly userPaymentHistoryService: UserPaymentHistoryService,
  ) {
    this.stripe = new Stripe(configService.stripeSecretKey, {
      apiVersion: AppConstants.stripe.apiVersion,
    });
  }

  async makePayment(
    userId: number,
    orderId: number,
    stripeId: string,
    deliveryCost: number,
  ): Promise<{
    status: string;
    message: string;
    data: Stripe.PaymentIntent | null;
  }> {
    console.log('makePayment called');
    console.log(
      'userId',
      userId,
      'orderId',
      orderId,
      'stripeId',
      stripeId,
      'deliveryCost',
      deliveryCost,
    );

    try {
      const customer = await this.stripe.customers.retrieve(stripeId);

      if ((customer as Stripe.DeletedCustomer).deleted) {
        return {
          status: 'error',
          message: 'Customer has been deleted',
          data: null,
        };
      }

      const activeCustomer = customer as Stripe.Customer;

      const defaultPaymentMethod =
        activeCustomer.invoice_settings.default_payment_method;
      if (!defaultPaymentMethod) {
        return {
          status: 'error',
          message: 'No default payment method set',
          data: null,
        };
      }

      const stripeAmount = Math.round(deliveryCost * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: 'aud',
        customer: stripeId,
        payment_method: defaultPaymentMethod as string,
        off_session: true,
        confirm: true,
      });

      //Update payment status
      await this.updatePaymentStatus(
        userId,
        orderId,
        paymentIntent.id,
        paymentIntent.status,
      );

      return {
        status: 'success',
        message: 'Charge successful',
        data: paymentIntent,
      };
    } catch (error) {
      //Update payment status
      // await this.updatePaymentStatus(userId, orderId, null, 'Cancelled');

      return {
        status: 'error',
        message: error.message,
        data: null,
      };
    }
  }

  async updatePaymentStatus(
    userId: number,
    orderId: number,
    stripe_id: string,
    status: string,
  ): Promise<any> {
    try {
      console.log('updatePaymentStatus called');
      console.log(
        'userId',
        userId,
        'orderId',
        orderId,
        'stripe_id',
        stripe_id,
        'payment_status',
        status,
      );

      if (!stripe_id) {
        return null;
      }
      // const { rider_id, fare_amount, payable_amount, created_at } = await this.entityManager.query(
      //   'SELECT rider_id, fare_amount, payable_amount, created_at FROM deliveries WHERE id = ?',
      //   [orderId],
      // )

      let payment_status = null;

      if (status === 'succeeded') {
        payment_status = 'Paid';
      } else if (status === 'canceled') {
        payment_status = 'Cancelled';
        // } else if (status === 'requires_action') {
        //   payment_status = 'Failed';
        // } else if (status === 'requires_payment_method') {
        //   payment_status = 'Failed';
        // } else if (status === 'requires_capture') {
        //   payment_status = 'Failed';
        // } else if (status === 'processing') {
        //   payment_status = 'Failed';
        // } else if (status === 'requires_confirmation') {
        //   payment_status = 'Failed';
        // } else if (status === 'requires_source') {
        //   payment_status = 'Failed';
      } else {
        payment_status = 'Failed';
      }

      await this.entityManager
        .createQueryBuilder()
        .update('payments')
        .set({ payment_status, stripe_id, updated_at: new Date() })
        .where('order_id = :orderId', { orderId })
        // .andWhere('payment_status != :payment_status', { payment_status })
        .execute();

      const payment = await this.entityManager
        .createQueryBuilder()
        .select('*')
        .from('payments', 'p')
        .where('p.stripe_id = :stripe_id', {
          stripe_id,
        })
        .getRawOne();

      console.log('payment', payment);

      if (payment) {
        console.log('updatePaymentStatus after PAID operated successfully');

        const order = await this.entityManager
          .createQueryBuilder()
          .select('*')
          .from('orders', 'o')
          .where('o.id = :orderId', { orderId })
          .getRawOne();

        const delivery = await this.entityManager
          .createQueryBuilder()
          .select('*')
          .from('deliveries', 'd')
          .where('d.order_id = :orderId', { orderId })
          .getRawOne();

        const the_tradebar_fee = await AppVariables.tradebarFee.percentage;

        console.log('the_tradebar_fee', the_tradebar_fee);

        const tradebar_percentage = the_tradebar_fee / 100;
        let payment_by = null;
        let customer_id = null;
        let warehouse_id = null;

        if (order.order_type === OrderType.TRANSPORTATION_ONLY) {
          payment_by = UserType.CUSTOMER;
          customer_id = order.customer_id;
        } else {
          payment_by = UserType.WAREHOUSE;
          warehouse_id = order.warehouse_id;
        }
        const fare_amount = Number(order.total_cost);
        const gst = Number(order.gst);
        const payable_amount = Number(fare_amount) + Number(gst);
        const tradebar_fee = payable_amount * tradebar_percentage;
        const net_balance = payable_amount - tradebar_fee;

        const createUserPaymentHistoryDto: CreateUserPaymentHistoryForDeliveryDto =
          {
            transaction_type: PaymentTransactionType.CREDIT,
            payment_status: payment_status,
            payment_by: payment_by,
            payment_for: UserType.RIDER,
            payment_id: payment.id,
            customer_id: customer_id,
            warehouse_id: warehouse_id,
            rider_id: delivery.rider_id,
            order_id: orderId,
            payable_amount: payable_amount,
            fare_amount: fare_amount,
            gst: gst,
            tradebar_fee: tradebar_fee,
            net_balance: net_balance,
            paid_at: new Date(),
          };

        const userPaymentHistory =
          await this.userPaymentHistoryService.createPaymentHistoryForDelivery(
            createUserPaymentHistoryDto,
          );

        console.log('userPaymentHistory', userPaymentHistory);

        // return userPaymentHistory;

        //Sent notification
        //.....
        // return payment;
      }
      return null;
    } catch (error) {
      console.error(error);
      throw new Error('Payment not found or update failed');
    }
  }
}
