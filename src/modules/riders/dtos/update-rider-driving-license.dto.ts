import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class UpdateRiderDrivingLicenseDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  driving_license_number: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  driving_license_image: Express.Multer.File;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  driving_verification_selfie_image: Express.Multer.File;
}
