import { Document, Model, model } from 'mongoose';
import { DeliverySchema } from '../schemas/delivery.schema';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { OrderType } from '@common/enums/order.enum';

export interface Delivery extends Document {
  order_type: OrderType;
  shipping_status: ShippingStatus;
  order_id?: number;
  customer?: object;
  warehouse?: object;
  total_weight?: string;
  init_distance?: string;
  init_duration?: string;
  delivery_charge?: string;
  rider_fee?: string;
  created_at?: Date;
}

export const DeliveryModel: Model<Delivery> = model<Delivery>(
  'Delivery',
  DeliverySchema,
);
