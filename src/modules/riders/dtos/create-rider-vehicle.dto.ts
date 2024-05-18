import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRiderVehicleDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  type_id: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  capacity: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  registration_number: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  tax_token_number: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  owner_name: string;
}
