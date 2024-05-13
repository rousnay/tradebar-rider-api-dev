import { ApiProperty } from '@nestjs/swagger';
import { Riders } from '../entities/riders.entity';

export class RiderPagedResponseDto {
  @ApiProperty({ description: 'Total number of riders' })
  totalCount: number;

  @ApiProperty({ description: 'Current page' })
  currentPage: number;

  @ApiProperty({ description: 'Current limit' })
  currentLimit: number;

  @ApiProperty({ description: 'List of riders' })
  data: [];
}
