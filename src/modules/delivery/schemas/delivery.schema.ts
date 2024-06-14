import { Schema } from 'mongoose';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { OrderType } from '@common/enums/order.enum';

export const DeliverySchema = new Schema(
  {
    delivery_type: {
      type: String,
      enum: OrderType,
      required: false,
    },
    shipping_status: {
      type: String,
      enum: ShippingStatus,
      default: ShippingStatus.WAITING,
    },
    order_id: { type: Number, required: false },
    customer: { type: Object, required: false },
    warehouse: { type: Object, required: false },
    total_weight: { type: Number, required: false },
    init_distance: { type: Number, required: false },
    init_duration: { type: Number, required: false },
    delivery_charge: { type: Number, required: false },
    created_at: { type: Date, required: false },
  },
  { timestamps: true },
);
