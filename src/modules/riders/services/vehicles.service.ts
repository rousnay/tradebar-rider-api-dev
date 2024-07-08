import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager } from 'typeorm';

import { ConfigService } from '@config/config.service';
import { AppConstants } from '@common/constants/constants';
import { Vehicles } from '../entities/vehicles.entity';
import { RiderVehicles } from '../entities/rider-vehicles.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { VehicleTypeService } from './vehicle-type.service';

@Injectable()
export class VehiclesService {
  private readonly cfAccountHash: string;
  private readonly cfMediaVariant = AppConstants.cloudflare.mediaVariant;
  private readonly cfMediaBaseUrl = AppConstants.cloudflare.mediaBaseUrl;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly entityManager: EntityManager,
    @InjectRepository(Vehicles)
    private vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(RiderVehicles)
    private riderVehiclesRepository: Repository<RiderVehicles>,
    private vehicleTypeService: VehicleTypeService,
    configService: ConfigService,
  ) {
    this.cfAccountHash = configService.cloudflareAccountHash;
  }

  async getAllVehiclesOfRider(type_id: number): Promise<any[]> {
    const rider_id = this.request['user'].id;
    const riderVehicles = await this.riderVehiclesRepository.find({
      where: { rider_id },
    });
    const vehicleIds = riderVehicles.map((rv) => rv.vehicle_id);
    const allVehicles = await this.vehiclesRepository.find({
      where: { id: In(vehicleIds), type_id },
    });

    // Use Promise.all to fetch vehicle types concurrently and transform the vehicles
    const modifiedVehicles = await Promise.all(
      allVehicles.map(async (vehicle) => {
        const vehicleTypeObj = await this.vehicleTypeService.findOne(
          vehicle.type_id,
        );
        // let vehicle_image_url = null;

        // if (vehicle.vehicle_image_cf_media_id != null) {
        //   const cloudflare_id = await this.entityManager
        //     .createQueryBuilder()
        //     .select(['cf.cloudflare_id'])
        //     .from('cf_media', 'cf')
        //     .where('cf.id = :id', { id: vehicle.vehicle_image_cf_media_id })
        //     .getRawOne();

        //   vehicle_image_url =
        //     this.cfMediaBaseUrl +
        //     '/' +
        //     this.cfAccountHash +
        //     '/' +
        //     cloudflare_id.cloudflare_id +
        //     '/' +
        //     this.cfMediaVariant;
        // }

        let vehicle_front_image_url = null;
        let vehicle_back_image_url = null;

        if (vehicle.vehicle_image_front_cf_media_id != null) {
          const cloudflare_id = await this.entityManager
            .createQueryBuilder()
            .select(['cf.cloudflare_id'])
            .from('cf_media', 'cf')
            .where('cf.id = :id', { id: vehicle.vehicle_image_front_cf_media_id })
            .getRawOne();

          vehicle_front_image_url =
            this.cfMediaBaseUrl +
            '/' +
            this.cfAccountHash +
            '/' +
            cloudflare_id.cloudflare_id +
            '/' +
            this.cfMediaVariant;
        }

        if (vehicle.vehicle_image_back_cf_media_id != null) {
          const cloudflare_id = await this.entityManager
            .createQueryBuilder()
            .select(['cf.cloudflare_id'])
            .from('cf_media', 'cf')
            .where('cf.id = :id', { id: vehicle.vehicle_image_back_cf_media_id })
            .getRawOne();

          vehicle_back_image_url =
            this.cfMediaBaseUrl +
            '/' +
            this.cfAccountHash +
            '/' +
            cloudflare_id.cloudflare_id +
            '/' +
            this.cfMediaVariant;
        }

        // Destructure vehicle to remove type_id
        const { type_id, ...vehicleWithoutTypeId } = vehicle;

        // Add type object to the vehicle
        return {
          ...vehicleWithoutTypeId,
          type: vehicleTypeObj,
          vehicle_front_image_url: vehicle_front_image_url,
          vehicle_back_image_url: vehicle_back_image_url
        };
      }),
    );

    return modifiedVehicles;
  }

  async getVehicleById(vehicle_id: number): Promise<{ data: any }> {
    const rider_id = this.request['user'].id;
    const riderVehicle = await this.riderVehiclesRepository.findOne({
      where: { rider_id, vehicle_id },
    });
    if (!riderVehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicle_id} not found`);
    }
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicle_id },
    });

    const vehicleTypeObj = await this.vehicleTypeService.findOne(
      vehicle.type_id,
    );

    let vehicle_front_image_url = null;
    let vehicle_back_image_url = null;

    if (vehicle.vehicle_image_front_cf_media_id != null) {
      const cloudflare_id = await this.entityManager
        .createQueryBuilder()
        .select(['cf.cloudflare_id'])
        .from('cf_media', 'cf')
        .where('cf.id = :id', { id: vehicle.vehicle_image_front_cf_media_id })
        .getRawOne();

      vehicle_front_image_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        cloudflare_id.cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    if (vehicle.vehicle_image_back_cf_media_id != null) {
      const cloudflare_id = await this.entityManager
        .createQueryBuilder()
        .select(['cf.cloudflare_id'])
        .from('cf_media', 'cf')
        .where('cf.id = :id', { id: vehicle.vehicle_image_back_cf_media_id })
        .getRawOne();

      vehicle_back_image_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        cloudflare_id.cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    // Destructure vehicle to remove type_id
    const { type_id, ...vehicleWithoutTypeId } = vehicle;

    return {
      data: {
        ...vehicleWithoutTypeId,
        type: vehicleTypeObj,
        vehicle_front_image_url,
        vehicle_back_image_url
      },
    };
  }

  async addVehicle(createVehicleDto: CreateVehicleDto): Promise<{ data: any }> {
    const rider_id = this.request['user'].id;
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    console.log(vehicle);
    const savedVehicle = await this.vehiclesRepository.save(vehicle);

    const riderVehicle = this.riderVehiclesRepository.create({
      rider_id,
      vehicle_id: savedVehicle.id,
    });
    await this.riderVehiclesRepository.save(riderVehicle);

    const vehicleTypeObj = await this.vehicleTypeService.findOne(
      createVehicleDto.type_id,
    );

    // Destructure savedVehicle to remove type_id
    const { type_id, ...vehicleWithoutTypeId } = savedVehicle;

    return { data: { ...vehicleWithoutTypeId, type: vehicleTypeObj } };
  }

  async updateVehicle(
    vehicle_id: number,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<{ data: any }> {
    const rider_id = this.request['user'].id;
    const riderVehicle = await this.riderVehiclesRepository.findOne({
      where: { rider_id, vehicle_id },
    });
    
    if (!riderVehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicle_id} not found`);
    }

    await this.vehiclesRepository.update(vehicle_id, updateVehicleDto);

    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicle_id },
    });

    const vehicleTypeObj = await this.vehicleTypeService.findOne(
      vehicle.type_id,
    );

    let vehicle_front_image_url = null;
    let vehicle_back_image_url = null;

    if (vehicle.vehicle_image_front_cf_media_id != null) {
      const cloudflare_id = await this.entityManager
        .createQueryBuilder()
        .select(['cf.cloudflare_id'])
        .from('cf_media', 'cf')
        .where('cf.id = :id', { id: vehicle.vehicle_image_front_cf_media_id })
        .getRawOne();

      vehicle_front_image_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        cloudflare_id.cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    if (vehicle.vehicle_image_back_cf_media_id != null) {
      const cloudflare_id = await this.entityManager
        .createQueryBuilder()
        .select(['cf.cloudflare_id'])
        .from('cf_media', 'cf')
        .where('cf.id = :id', { id: vehicle.vehicle_image_back_cf_media_id })
        .getRawOne();

      vehicle_back_image_url =
        this.cfMediaBaseUrl +
        '/' +
        this.cfAccountHash +
        '/' +
        cloudflare_id.cloudflare_id +
        '/' +
        this.cfMediaVariant;
    }

    // Destructure vehicle to remove type_id
    const { type_id, ...vehicleWithoutTypeId } = vehicle;

    return {
      data: {
        ...vehicleWithoutTypeId,
        type: vehicleTypeObj,
        vehicle_front_image_url,
        vehicle_back_image_url
      },
    };
  }
}
