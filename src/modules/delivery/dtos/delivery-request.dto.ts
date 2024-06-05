import { ShippingStatus, DeliveryType } from '@common/enums/delivery.enum';

export class DeliveryDto {
  id: number;
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

  //   rider_id?: number;
  //   vehicle_id?: number;
  //   final_distance?: number;
  //   final_duration?: number;
  //   accepted_at?: Date;
  //   picked_up_at?: Date;
  //   delivered_at?: Date;
  //   cancelled_at?: Date;
  //   updated_at: Date;
}
