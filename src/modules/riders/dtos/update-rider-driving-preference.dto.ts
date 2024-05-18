import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateRiderDrivingPreferenceDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  driving_city_id: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  driving_destination_range_id: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  driving_schedule_id: number;
}
