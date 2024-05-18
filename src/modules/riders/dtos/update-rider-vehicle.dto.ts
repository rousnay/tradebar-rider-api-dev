import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRiderVehicleDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  type_id?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ required: false })
  registration_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ required: false })
  tax_token_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ required: false })
  owner_name?: string;
}
