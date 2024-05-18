import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiderVehicles } from '../entities/rider-vehicles.entity';
import { CreateRiderVehicleDto } from '../dtos/create-rider-vehicle.dto';
import { UpdateRiderVehicleDto } from '../dtos/update-rider-vehicle.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class RiderVehiclesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(RiderVehicles)
    private riderVehiclesRepository: Repository<RiderVehicles>,
  ) {}

  async getAllVehiclesOfRider(): Promise<RiderVehicles[]> {
    const rider_id = this.request['user'].id;
    return this.riderVehiclesRepository.find({ where: { rider_id } });
  }

  async getVehicleById(vehicle_id: number): Promise<RiderVehicles> {
    const rider_id = this.request['user'].id;
    const vehicle = await this.riderVehiclesRepository.findOne({
      where: { id: vehicle_id, rider_id },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicle_id} not found`);
    }
    return vehicle;
  }

  async addVehicle(
    createRiderVehicleDto: CreateRiderVehicleDto,
  ): Promise<RiderVehicles> {
    const rider_id = this.request['user'].id;
    const vehicle = this.riderVehiclesRepository.create({
      ...createRiderVehicleDto,
      rider_id,
    });
    return this.riderVehiclesRepository.save(vehicle);
  }

  async updateVehicle(
    vehicle_id: number,
    updateRiderVehicleDto: UpdateRiderVehicleDto,
  ): Promise<RiderVehicles> {
    const vehicle = await this.getVehicleById(vehicle_id);
    Object.assign(vehicle, updateRiderVehicleDto);
    return this.riderVehiclesRepository.save(vehicle);
  }
}
