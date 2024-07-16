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

  async makePayment(
    deliveryId: number,
    order: any,
  ): Promise<{
    status: string;
    message: string;
    data: Stripe.PaymentIntent | null;
  }> {
    const user = this.request['user'];
    const userEmail = user.email;

    const amount = order?.payable_amount * 100;

    if (!userEmail) {
      return {
        status: 'error',
        message: 'User email not found',
        data: null,
      };
    }

    const customerDetails = await this.entityManager.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [userEmail],
    );

    if (customerDetails.length === 0) {
      return {
        status: 'error',
        message: 'Customer not found',
        data: null,
      };
    }

    const customerStripeId = customerDetails[0]?.stripe_id;
    if (!customerStripeId) {
      return {
        status: 'error',
        message: 'Customer stripe ID not found',
        data: null,
      };
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerStripeId);

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

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'aud',
        customer: customerStripeId,
        payment_method: defaultPaymentMethod as string,
        off_session: true,
        confirm: true,
      });

      return {
        status: 'success',
        message: 'Charge successful',
        data: paymentIntent,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        data: null,
      };
    }
  }

  async storePaymentStatus(
    order_id: number,
    stripe_id: string,
    payment_status: string,
  ): Promise<any> {
    const payment_by = this.request['user'].id;
    try {
      const insertResult = await this.entityManager
        .createQueryBuilder()
        .insert()
        .into('payments')
        .values({ order_id, stripe_id, payment_status, payment_by })
        .execute();

      const insertedId = await insertResult?.raw?.insertId;
      console.log(insertedId);
      if (insertedId) {
        const payment = await this.entityManager
          .createQueryBuilder()
          .select('*')
          .from('payments', 'p')
          .where('p.id = :id', { id: insertedId })
          .getRawOne();

        if (payment) {
          console.log(payment);
          return payment;
        }
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Payment creation failed');
    }
  }

  async updatePaymentStatus(
    stripe_id: string,
    payment_status: string,
    isFromWarehouse: boolean,
  ): Promise<any> {
    try {
      console.log('updatePaymentStatus called');
      // const updateResult = await this.entityManager;
      await this.entityManager
        .createQueryBuilder()
        .update('payments')
        .set({ payment_status })
        .where('stripe_id = :stripe_id', { stripe_id })
        .andWhere('payment_status != :payment_status', { payment_status })
        .execute();

      //   const query = `
      //     SELECT o.order_type
      //     FROM payments p
      //     INNER JOIN orders o ON o.id = p.order_id
      //     WHERE p.stripe_id = ?
      // `;

      // const order_type = await this.entityManager.query(query, [stripe_id]);

      // if (updateResult.affected > 0) {

      // if (
      //   (payment_status === 'Paid' &&
      //     order_type[0].order_type !== 'product_and_transport') ||
      //   isFromWarehouse
      // ) {

      if (payment_status === 'Paid') {
        const payment = await this.entityManager
          .createQueryBuilder()
          .select('*')
          .from('payments', 'p')
          .where('p.stripe_id = :stripe_id', {
            stripe_id,
          })
          .getRawOne();

        if (payment) {
          console.log('updatePaymentStatus operated successfully');
          // const riderDeviceTokens =
          //   await this.deliveryService.sendDeliveryRequest(stripe_id);

          // const buildDeliveryRequestPayload =
          //   await this.deliveryRequestService.getDeliveryRequestPayloadByStripeId(
          //     stripe_id,
          //   );

          // const getDeliveryRequestData =
          //   await this.deliveryRequestService.create(
          //     buildDeliveryRequestPayload,
          //   );

          //NEED TO CHANGE DELIVERY STATUS TO SEARCHING...

          const riderDeviceTokens = [];
          const getDeliveryRequestData = null;

          const requestedByUserId = getDeliveryRequestData?.requestFrom?.id;
          const requestedByUserName = getDeliveryRequestData?.requestFrom?.name;
          const requestId = getDeliveryRequestData?.id;
          const title = 'New Delivery Request';
          const message =
            'You have a new delivery request from ' + requestedByUserName;
          const data = {
            target: 'rider',
            type: 'delivery_request',
            requestId: requestId,
            requestedByUserId: requestedByUserId.toString(),
            requestedByUserName: requestedByUserName,
          };

          for (const rider of riderDeviceTokens) {
            console.log('rider', rider);
            for (const deviceToken of rider.deviceTokens) {
              await this.notificationService.sendAndStoreDeliveryRequestNotification(
                rider.userId,
                deviceToken,
                title,
                message,
                { ...data, riderId: rider.riderId.toString() },
              );
            }
          }

          return payment;
        }
        return null;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Payment not found or update failed');
    }
  }

  async findOrCreateCustomer(
    email: string,
    name: string,
    phone: string,
  ): Promise<Stripe.Customer> {
    // Find existing customer by email
    const customers = await this.stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      // Customer with email exists
      return customers.data[0];
    } else {
      // Customer with email does not exist, create a new customer
      const customer = await this.stripe.customers.create({
        email: email,
        name: name,
        phone: phone,
      });
      return customer;
    }
  }
  async createCheckoutSession(order: any): Promise<Stripe.Checkout.Session> {
    const user = this.request['user'];
    const customer = await this.findOrCreateCustomer(
      user.email,
      user.name,
      user.phone,
    );
    try {
      // Create a checkout session with Stripe
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'aud',
              product_data: {
                name: 'Transportation Service', // Customize as needed
              },
              unit_amount: order.payable_amount * 100, // Stripe requires amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // payment_method: 'pm_1PE9VPGJkp9au0iQJj9pxwaB',
        // customer_details: {
        //   // address:
        //   //   "{ 'line1': '123 Main St', 'city': 'San Francisco', 'state': 'CA', 'postal_code': '94105', 'country': 'US' }",
        //   email: order.email,
        //   // name: order.name,
        //   // phone: '01234567890',
        // },
        // customer: {
        //   name: order.name, // Include user's name in the payment request
        // },
        // customer_name: "John Doe",
        // customer_phone: '01234567890',
        // customer_email: customer.email,
        // customer_address:
        //   '{ "line1": "123 Main St", "city": "San Francisco", "state": "CA", "postal_code": "94105", "country": "US" }',
        customer: customer.id,
        success_url: AppConstants.stripe.success_url, // Redirect URL after successful payment
        cancel_url: AppConstants.stripe.cancel_url, // Redirect URL if payment is canceled
      });

      // Return the checkout session
      return session;
    } catch (error) {
      console.error('Error processing payment:', error.message);
      throw new Error('Error processing payment');
    }
  }

  async createPaymentIntent(order: any): Promise<Stripe.PaymentIntent> {
    const user = this.request['user'];
    const customer = await this.findOrCreateCustomer(
      user.email,
      user.name,
      user.phone,
    );
    try {
      console.log('order.payable_amount', order?.payable_amount);
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: order?.payable_amount * 100,
        currency: 'aud',
        customer: customer?.id, // Reference the customer ID
      });

      // Return the payment intent
      return paymentIntent;
    } catch (error) {
      throw new Error('Failed to create payment intent');
    }
  }
}
