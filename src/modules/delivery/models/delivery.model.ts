import { Document, Model, model } from 'mongoose';
import { DeliverySchema } from '../schemas/delivery.schema';
import { ShippingStatus, DeliveryType } from '@common/enums/delivery.enum';

export interface Delivery extends Document {
  delivery_type: DeliveryType;
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
