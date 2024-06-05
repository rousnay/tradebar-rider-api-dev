import { IsEnum, IsInt, IsOptional, IsNumber, IsDate } from 'class-validator';
import { ShippingStatus } from '@common/enums/delivery.enum';

export class CreateDeliveryDto {
  @IsEnum(ShippingStatus)
  shipping_status: ShippingStatus;

  @IsOptional()
  @IsInt()
  rider_id?: number;

  @IsOptional()
  @IsInt()
  vehicle_id?: number;

  @IsOptional()
  @IsDate()
  accepted_at?: Date;
}
