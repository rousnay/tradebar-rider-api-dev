import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  // @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false, type: Number })
  owner_id?: number;

  // @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false, type: Number })
  type_id?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  brand?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  model?: string;

  // @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false, type: Number })
  year?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  color?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  license_plate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  registration_number?: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Vehicle image',
    required: false,
  })
  vehicle_image?: Express.Multer.File;

  @IsOptional()
  vehicle_image_url?: string;

  @IsOptional()
  vehicle_image_cf_media_id?: number;
}
