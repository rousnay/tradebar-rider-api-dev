import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { EntityManager } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryRequest } from './schemas/delivery-request.schema';
import { Model } from 'mongoose';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { OrderType } from '@common/enums/order.enum';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    private locationService: LocationService,
  ) {}

  async findAll(req: any): Promise<any[]> {
    const { id } = req.user;
    const query = `
    SELECT
      d.id,
      d.order_id,
      o.order_type as order_type,
      w.id as warehouse_id,
      w.name as warehouse_name,
      wb.id as warehouse_branch_id,
      wb.name as warehouse_branch_name,
      c.id as customer_id,
      c.first_name as customer_first_name,
      c.last_name as customer_last_name,
      d.delivery_charge,
      d.shipping_status,
      d.accepted_at,
      d.picked_up_at,
      d.cancelled_at,
      d.delivered_at,

        ors.id AS order_review_id,
        ors.model_id AS order_review_model_id,
        ors.given_by_id AS order_review_given_by_id,
        ors.given_by_type_id AS order_review_given_by_type_id,
        ors.given_to_id AS order_review_given_to_id,
        ors.given_to_type_id AS order_review_given_to_type_id,
        ors.rating AS order_review_rating,
        ors.review AS order_review_review,
        ors.reply AS order_review_reply,
        ors.created_at AS order_review_created_at,
        ors.updated_at AS order_review_updated_at

    FROM
      deliveries d
    INNER JOIN
      orders o ON o.id = d.order_id
    LEFT JOIN
      customers c ON c.id = o.customer_id
    LEFT JOIN
      warehouses w ON w.id = o.warehouse_id
    LEFT JOIN
      warehouse_branches wb ON wb.warehouse_id = w.id
    LEFT JOIN
        overall_reviews ors ON o.id = ors.model_id AND ors.model = 'App\\\\Models\\\\Order'
    WHERE
      d.rider_id = ?
    ORDER BY
      d.delivered_at
    `;

    const deliveries = await this.entityManager.query(query, [id]);

    const modifiedDeliveries = deliveries.map((result) => {
      if (result.order_type === OrderType.TRANSPORTATION_ONLY) {
        const {
          customer_id,
          customer_first_name,
          customer_last_name,
          warehouse_id,
          warehouse_name,
          warehouse_branch_id,
          warehouse_branch_name,
          ...rest
        } = result;

        return {
          order_from: {
            id: Number(customer_id),
            name: customer_first_name + ' ' + customer_last_name,
            url: null,
          },
          ...rest,
          requestFrom: {
            id: customer_id,
            name: `${customer_first_name} ${customer_last_name}`,
            url: null,
          },
        };
      } else {
        const {
          customer_id,
          customer_first_name,
          customer_last_name,
          warehouse_branch_id,
          warehouse_branch_name,
          ...rest
        } = result;
        return {
          order_from: {
            id: Number(warehouse_branch_id),
            name: warehouse_branch_name,
            url: null,
          },
          ...rest,
          requestFrom: {
            id: Number(warehouse_branch_id),
            name: warehouse_branch_name,
            url: null,
          },
        };
      }
    });

    const allDeliveries = modifiedDeliveries.reduce((acc, row) => {
      let order = acc.find((o) => o.id === row.id);
      if (!order) {
        order = {
          id: row.id,
          order_from: row.order_from,
          order_id: row.order_id,
          order_type: row.order_type,
          shipping_status: row.shipping_status,
          delivery_charge: row.delivery_charge,
          created_at: row.created_at,
          accepted_at: row.accepted_at,
          picked_up_at: row.picked_up_at,
          delivered_at: row.delivered_at,
          cancelled_at: row.cancelled_at,
          updated_at: row.updated_at,
          reviews: {
            given: null,
            received: null,
          },
        };
        acc.push(order);
      }

      if (row.order_review_id) {
        const review = {
          id: row.order_review_id,
          model_id: row.order_review_model_id,
          given_by_id: row.order_review_given_by_id,
          given_by_type_id: row.order_review_given_by_type_id,
          given_to_id: row.order_review_given_to_id,
          given_to_type_id: row.order_review_given_to_type_id,
          rating: row.order_review_rating,
          review: row.order_review_review,
          reply: row.order_review_reply,
          created_at: row.order_review_created_at,
          updated_at: row.order_review_updated_at,
        };

        if (Number(row.order_review_given_by_id) === id) {
          order.reviews.given = {
            id: Number(review.id),
            rating: review.rating,
            review: review.review,
            created_at: review.created_at,
            updated_at: review.updated_at,
          };
        } else if (Number(row.order_review_given_to_id) === id) {
          order.reviews.received = {
            id: Number(review.id),
            rating: review.rating,
            review: review.review,
            created_at: review.created_at,
            updated_at: review.updated_at,
          };
        }
      }

      return acc;
    }, []);

    // return modifiedDeliveries;
    return allDeliveries;
  }

  async findOne(req: any, deliveryId: number): Promise<any> {
    const { id } = req.user;
    const query = `
    SELECT
      d.id,
      d.order_id,
      o.order_type as order_type,

      w.id as warehouse_id,
      w.name as warehouse_name,

      wb.id as warehouse_branch_id,
      wb.name as warehouse_branch_name,
      wb.branch_type as warehouse_branch_type,
      wb.phone as warehouse_branch_phone,
      wb.address as warehouse_branch_address,
      wb.postal_code as warehouse_branch_postal_code,
      wb.latitude as warehouse_branch_latitude,
      wb.longitude as warehouse_branch_longitude,
      wb.contact_person_name as warehouse_branch_contact_person_name,
      wb.contact_person_email as warehouse_branch_contact_person_email,

        pickup_cb.id AS pickup_id,
        pickup_cb.first_name AS pickup_first_name,
        pickup_cb.last_name AS pickup_last_name,
        pickup_cb.phone_number_1 AS pickup_phone_number_1,
        pickup_cb.phone_number_2 AS pickup_phone_number_2,
        pickup_cb.address AS pickup_address,
        pickup_cb.city AS pickup_city,
        pickup_cb.state AS pickup_state,
        pickup_cb.postal_code AS pickup_postal_code,
        pickup_cb.country_id AS pickup_country_id,
        pickup_cb.latitude AS pickup_latitude,
        pickup_cb.longitude AS pickup_longitude,
        pickup_cb.notes AS pickup_notes,

        shipping_cb.id AS shipping_id,
        shipping_cb.first_name AS shipping_first_name,
        shipping_cb.last_name AS shipping_last_name,
        shipping_cb.phone_number_1 AS shipping_phone_number_1,
        shipping_cb.phone_number_2 AS shipping_phone_number_2,
        shipping_cb.address AS shipping_address,
        shipping_cb.city AS shipping_city,
        shipping_cb.state AS shipping_state,
        shipping_cb.postal_code AS shipping_postal_code,
        shipping_cb.country_id AS shipping_country_id,
        shipping_cb.latitude AS shipping_latitude,
        shipping_cb.longitude AS shipping_longitude,
        shipping_cb.notes AS shipping_notes,


        c.id as customer_id,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        d.delivery_charge,
        d.shipping_status,
        d.init_distance as distance,
        d.init_duration as duration,
        d.accepted_at,
        d.delivered_at,

        ors.id AS order_review_id,
        ors.model_id AS order_review_model_id,
        ors.given_by_id AS order_review_given_by_id,
        ors.given_by_type_id AS order_review_given_by_type_id,
        ors.given_to_id AS order_review_given_to_id,
        ors.given_to_type_id AS order_review_given_to_type_id,
        ors.rating AS order_review_rating,
        ors.review AS order_review_review,
        ors.reply AS order_review_reply,
        ors.created_at AS order_review_created_at,
        ors.updated_at AS order_review_updated_at

    FROM
      deliveries d
    INNER JOIN
      orders o ON o.id = d.order_id
    LEFT JOIN
      customers c ON c.id = o.customer_id
    LEFT JOIN
      user_address_book shipping_cb ON shipping_cb.id = o.shipping_address_id
    LEFT JOIN
      user_address_book pickup_cb ON pickup_cb.id = o.pickup_address_id
    LEFT JOIN
      warehouses w ON w.id = o.warehouse_id
    LEFT JOIN
      warehouse_branches wb ON wb.warehouse_id = w.id
    LEFT JOIN
        overall_reviews ors ON o.id = ors.model_id AND ors.model = 'App\\\\Models\\\\Order'
    WHERE
      d.rider_id = ? AND d.id = ?
    `;

    const results = await this.entityManager.query(query, [id, deliveryId]);

    // if (results.length === 0) {
    //   throw new Error('Delivery not found');
    // }

    if (results.length === 0) {
      throw new NotFoundException('Delivery not found');
    }

    let givenReview = null;
    let receivedReview = null;

    results.map((row) => {
      const review = {
        id: row.order_review_id,
        model_id: row.order_review_model_id,
        given_by_id: row.order_review_given_by_id,
        given_by_type_id: row.order_review_given_by_type_id,
        given_to_id: row.order_review_given_to_id,
        given_to_type_id: row.order_review_given_to_type_id,
        rating: row.order_review_rating,
        review: row.order_review_review,
        reply: row.order_review_reply,
        created_at: row.order_review_created_at,
        updated_at: row.order_review_updated_at,
      };

      if (Number(row.order_review_given_by_id) === id) {
        givenReview = {
          id: Number(review.id),
          rating: review.rating,
          review: review.review,
          created_at: review.created_at,
          updated_at: review.updated_at,
        };
      } else if (Number(row.order_review_given_to_id) === id) {
        receivedReview = {
          id: Number(review.id),
          rating: review.rating,
          review: review.review,
          created_at: review.created_at,
          updated_at: review.updated_at,
        };
      }

      return review;
    });

    const reviews = {
      given: givenReview,
      received: receivedReview,
    };

    const {
      order_review_id,
      order_review_model_id,
      order_review_given_by_id,
      order_review_given_by_type_id,
      order_review_given_to_id,
      order_review_given_to_type_id,
      order_review_rating,
      order_review_review,
      order_review_reply,
      order_review_created_at,
      order_review_updated_at,
      ...modifiedResult
    } = results[0];

    let deliveryData;
    if (modifiedResult.order_type === OrderType.TRANSPORTATION_ONLY) {
      const {
        customer_id,
        customer_first_name,
        customer_last_name,

        pickup_id,
        pickup_first_name,
        pickup_last_name,
        pickup_phone_number_1,
        pickup_phone_number_2,
        pickup_address,
        pickup_city,
        pickup_state,
        pickup_postal_code,
        pickup_country_id,
        pickup_latitude,
        pickup_longitude,
        pickup_notes,

        shipping_id,
        shipping_first_name,
        shipping_last_name,
        shipping_phone_number_1,
        shipping_phone_number_2,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country_id,
        shipping_latitude,
        shipping_longitude,
        shipping_notes,

        warehouse_id,
        warehouse_name,
        warehouse_branch_id,
        warehouse_branch_name,
        warehouse_branch_type,
        warehouse_branch_phone,
        warehouse_branch_address,
        warehouse_branch_postal_code,
        warehouse_branch_latitude,
        warehouse_branch_longitude,
        warehouse_branch_contact_person_name,
        warehouse_branch_contact_person_email,

        ...rest
      } = modifiedResult;
      deliveryData = {
        ...rest,
        requestFrom: {
          id: customer_id,
          name: `${customer_first_name} ${customer_last_name}`,
          url: null,
        },
        pickupLocation: {
          id: pickup_id,
          name: pickup_first_name + ' ' + pickup_last_name,
          phone: pickup_phone_number_1,
          phone_number_2: pickup_phone_number_2,
          address: pickup_address,
          city: pickup_city,
          state: pickup_state,
          postal_code: pickup_postal_code,
          country_id: pickup_country_id,
          latitude: pickup_latitude,
          longitude: pickup_longitude,
          notes: pickup_notes,
        },
        dropOffLocation: {
          id: shipping_id,
          name: shipping_first_name + ' ' + shipping_last_name,
          phone: shipping_phone_number_1,
          phone_number_2: shipping_phone_number_2,
          address: shipping_address,
          city: shipping_city,
          state: shipping_state,
          postal_code: shipping_postal_code,
          country_id: shipping_country_id,
          latitude: shipping_latitude,
          longitude: shipping_longitude,
          notes: shipping_notes,
        },
      };
    } else {
      const {
        warehouse_branch_id,
        warehouse_branch_name,
        warehouse_branch_phone,
        warehouse_branch_address,
        warehouse_branch_postal_code,
        warehouse_branch_latitude,
        warehouse_branch_longitude,
        warehouse_branch_contact_person_name,
        warehouse_branch_contact_person_email,

        shipping_id,
        shipping_first_name,
        shipping_last_name,
        shipping_phone_number_1,
        shipping_phone_number_2,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country_id,
        shipping_latitude,
        shipping_longitude,
        shipping_notes,

        pickup_id,
        pickup_first_name,
        pickup_last_name,
        pickup_phone_number_1,
        pickup_phone_number_2,
        pickup_address,
        pickup_city,
        pickup_state,
        pickup_postal_code,
        pickup_country_id,
        pickup_latitude,
        pickup_longitude,
        pickup_notes,
        ...rest
      } = modifiedResult;
      deliveryData = {
        ...rest,
        requestFrom: {
          id: Number(warehouse_branch_id),
          name: warehouse_branch_name,
          url: null,
        },
        pickupLocation: {
          id: Number(warehouse_branch_id),
          name: warehouse_branch_name,
          phone: warehouse_branch_phone,
          address: warehouse_branch_address,
          postal_code: warehouse_branch_postal_code,
          latitude: Number(warehouse_branch_latitude),
          longitude: Number(warehouse_branch_longitude),
          contact_person_name: warehouse_branch_contact_person_name,
          contact_person_email: warehouse_branch_contact_person_email,
        },
        dropOffLocation: {
          id: shipping_id,
          name: shipping_first_name + ' ' + shipping_last_name,
          phone: shipping_phone_number_1,
          phone_number_2: shipping_phone_number_2,
          address: shipping_address,
          city: shipping_city,
          state: shipping_state,
          postal_code: shipping_postal_code,
          country_id: shipping_country_id,
          latitude: shipping_latitude,
          longitude: shipping_longitude,
          notes: shipping_notes,
        },
      };
    }

    return { ...deliveryData, reviews };
  }
}
