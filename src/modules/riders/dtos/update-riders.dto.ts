import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEmpty,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
// import { PartialType } from '@nestjs/mapped-types';
import { CreateRiderDto } from './create-riders.dto';
import { Gender } from '../entities/riders.entity'; // Adjust the import path if necessary

export class UpdateRiderDto extends PartialType(CreateRiderDto) {
  @IsOptional()
  @IsDateString(
    {},
    { message: 'Date format must be a valid ISO 8601 date string' },
  )
  @ApiProperty({
    description: 'Format: YYYY-MM-DD',
    type: Date,
    required: false,
  })
  date_of_birth?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Gender',
    enum: Gender,
    required: false,
  })
  gender?: Gender | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Driving license number',
    required: false,
  })
  driving_license_number?: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile image',
    required: false,
  })
  profile_image?: Express.Multer.File;

  @IsOptional()
  profile_image_url?: string;

  @IsOptional()
  profile_image_cf_media_id?: number;
}
