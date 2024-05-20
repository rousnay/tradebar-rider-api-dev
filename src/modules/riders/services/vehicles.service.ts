import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Vehicles } from '../entities/vehicles.entity';
import { RiderVehicles } from '../entities/rider-vehicles.entity';
import { CreateVehicleDto } from '../dtos/create-vehicle.dto';
import { UpdateVehicleDto } from '../dtos/update-vehicle.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class VehiclesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Vehicles)
    private vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(RiderVehicles)
    private riderVehiclesRepository: Repository<RiderVehicles>,
  ) {}

  async getAllVehiclesOfRider(): Promise<Vehicles[]> {
    const rider_id = this.request['user'].id;
    const riderVehicles = await this.riderVehiclesRepository.find({
      where: { rider_id },
    });
    const vehicleIds = riderVehicles.map((rv) => rv.vehicle_id);
    return this.vehiclesRepository.find({ where: { id: In(vehicleIds) } });
  }

  async getVehicleById(vehicle_id: number): Promise<{ data: Vehicles }> {
    const rider_id = this.request['user'].id;
    const riderVehicle = await this.riderVehiclesRepository.findOne({
      where: { rider_id, vehicle_id },
    });
    if (!riderVehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicle_id} not found`);
    }
    const theVehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicle_id },
    });

    return { data: theVehicle };
  }

  async addVehicle(createVehicleDto: CreateVehicleDto): Promise<{ data: any }> {
    const rider_id = this.request['user'].id;
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    console.log(vehicle);
    const savedVehicle = await this.vehiclesRepository.save(vehicle);

    console.log(savedVehicle);

    const riderVehicle = this.riderVehiclesRepository.create({
      rider_id,
      vehicle_id: savedVehicle.id,
    });
    await this.riderVehiclesRepository.save(riderVehicle);

    return {
      data: savedVehicle,
    };
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

    const updatedVehicle = this.vehiclesRepository.findOne({
      where: { id: vehicle_id },
    });

    console.log(updatedVehicle);

    return { data: updatedVehicle };
  }
}
