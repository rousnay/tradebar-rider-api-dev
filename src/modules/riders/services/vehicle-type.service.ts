import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { VehicleTypeDto } from '../dtos/vehicle-type.dto';
import { AppConstants } from 'src/common/constants/constants';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class VehicleTypeService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async findAll(): Promise<VehicleTypeDto[]> {
    try {
      const query = await this.entityManager
        .createQueryBuilder()
        .select(['vt.*', 's.name', 's.code', 'm.cloudflare_id', 'm.file'])
        .from('vehicle_types', 'vt')
        .leftJoin('statuses', 's', 'vt.type_id = s.id')
        .leftJoin('cf_media', 'm', 'vt.cf_media_id = m.id')
        .getRawMany();

      // Check if no data found
      if (query.length === 0) {
        throw new NotFoundException('No vehicle types found.');
      }

      // Map raw results to DTO to return specific fields
      const vehicleTypes: VehicleTypeDto[] = query.map((row) => ({
        id: row.id,
        type_id: row.type_id,
        name: row.name,
        code: row.code,
        media_url:
          this.cfMediaBaseUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          row.cloudflare_id +
          '/' +
          this.cfMediaVariant,
        vehicle_capacity: row.vehicle_capacity,
        active: row.active,
      }));

      return vehicleTypes;
    } catch (error) {
      // Log the error and rethrow it for the calling code to handle
      console.error('Error fetching vehicle types:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<VehicleTypeDto> {
    try {
      const query = await this.entityManager
        .createQueryBuilder()
        .select(['vt.*', 's.name', 's.code', 'm.cloudflare_id', 'm.file'])
        .from('vehicle_types', 'vt')
        .leftJoin('statuses', 's', 'vt.type_id = s.id')
        .leftJoin('cf_media', 'm', 'vt.cf_media_id = m.id')
        .where('vt.type_id = :id', { id })
        .getRawOne();

      if (!query) {
        throw new NotFoundException('Vehicle type not found');
      }

      console.log(query);

      const media_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        query.cloudflare_id +
        '/' +
        this.cfMediaVariant;

      const vehicleTypes: VehicleTypeDto = {
        id: query.id,
        type_id: query.type_id,
        name: query.name,
        code: query.code,
        media_url: media_url,
        vehicle_capacity: query.vehicle_capacity,
        active: query.active,
      };

      return vehicleTypes;

      // return query;
    } catch (error) {
      // Log the error and rethrow it for the calling code to handle
      console.error('Error fetching vehicle type with id ' + id + ':', error);
      throw error;
    }
  }
}
