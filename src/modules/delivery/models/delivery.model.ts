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
  total_weight?: number;
  init_distance?: number;
  init_duration?: number;
  delivery_charge?: number;
  created_at?: Date;
}

export const DeliveryModel: Model<Delivery> = model<Delivery>(
  'Delivery',
  DeliverySchema,
);
