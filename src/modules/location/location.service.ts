import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { REQUEST } from '@nestjs/core';
import { Model } from 'mongoose';
import { Location } from './schemas/location.schema';
import { SetCoordinatesAndSimulateDto } from './dtos/set-coordinates-and-simulate.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Riders } from '@modules/riders/entities/riders.entity';
import { EntityManager, Repository } from 'typeorm';
import { Vehicles } from '@modules/riders/entities/vehicles.entity';

@Injectable()
export class LocationService {
  private minLatitude: number;
  private maxLatitude: number;
  private minLongitude: number;
  private maxLongitude: number;
  private readonly interval = 1000; // 1 seconds in milliseconds
  private intervalRef: NodeJS.Timeout;

  constructor(
    // @Inject(REQUEST) private readonly request: Request,
    @InjectModel('Location') private locationModel: Model<Location>,
    private readonly entityManager: EntityManager,
    @InjectRepository(Vehicles)
    private vehiclesRepository: Repository<Vehicles>,
  ) {}

  private getRandomCoordinate(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private async generateAndSaveRandomLocation(riderId: number) {
    const latitude = this.getRandomCoordinate(
      this.minLatitude,
      this.maxLatitude,
    );
    const longitude = this.getRandomCoordinate(
      this.minLongitude,
      this.maxLongitude,
    );
    const timestamp = new Date();

    try {
      // Update the existing entry or create a new one if it doesn't exist
      await this.locationModel.findOneAndUpdate(
        { riderId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            isActive: true,
            updatedAt: timestamp,
          },
        },
        { upsert: true, new: true },
      );
      return { riderId, latitude, longitude, timestamp };
    } catch (error) {
      console.error(`Failed to update location for rider ${riderId}:`, error);
      return null;
    }
  }

  async startSimulation(dto: SetCoordinatesAndSimulateDto): Promise<any[]> {
    this.minLatitude = dto.minLatitude;
    this.maxLatitude = dto.maxLatitude;
    this.minLongitude = dto.minLongitude;
    this.maxLongitude = dto.maxLongitude;

    const messages: any[] = [];
    let currentRider = 0;

    const simulationPromise = new Promise<void>((resolve) => {
      this.intervalRef = setInterval(async () => {
        if (currentRider >= dto.riderCount) {
          this.stopSimulation();
          resolve();
          return;
        }
        const riderId = '999' + String(currentRider + 1).padStart(3, '0'); // Pads the number with leading zeros
        const data = await this.generateAndSaveRandomLocation(Number(riderId)); // Convert riderId to number (riderId);
        if (data) {
          messages.push(data);
          currentRider++;
        }
      }, this.interval);
    });

    await simulationPromise;
    return messages;
  }

  stopSimulation(): string {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
      return 'Simulation stopped successfully.';
    } else {
      return 'No active simulation to stop.';
    }
  }

  async updateLocation(
    riderId: number,
    latitude: number,
    longitude: number,
    isActive?: boolean,
  ): Promise<Location> {
    const updateData: any = {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      updatedAt: new Date(),
    };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    return this.locationModel
      .findOneAndUpdate(
        { riderId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();
  }

  async updateRiderLocation(
    req: any,
    latitude: number,
    longitude: number,
  ): Promise<Location> {
    const riderId = req.user.id;
    console.log('rider_Id', riderId);
    const updateData: any = {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      updatedAt: new Date(),
    };

    return this.locationModel
      .findOneAndUpdate(
        { riderId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();
  }

  async updateOnlineStatus(
    req: any,
    isActive: boolean,
    vehicleId: number,
    latitude: number,
    longitude: number,
  ): Promise<Location> {
    const riderId = req.user.id;
    const updateData: any = {
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      isActive,
      updatedAt: new Date(),
    };

    let updateActiveStatusQuery = `
    UPDATE riders
      SET is_active = ?,
          updated_at = NOW()`;

    const queryParams: (boolean | number)[] = [isActive];

    // Check if vehicleId exists
    if (vehicleId) {
      // Append the active_vehicle_id update part to the query
      updateActiveStatusQuery += `, active_vehicle_id = ?`;
      queryParams.push(vehicleId);

      // Find the vehicle and update the activeVehicleTypeId
      const vehicle = await this.vehiclesRepository.findOne({
        where: { id: vehicleId },
      });

      updateData.activeVehicleId = vehicleId;
      updateData.activeVehicleTypeId = vehicle?.type_id;
    }

    updateActiveStatusQuery += ` WHERE id = ?`;
    queryParams.push(riderId);

    await this.entityManager.query(updateActiveStatusQuery, queryParams);

    return this.locationModel
      .findOneAndUpdate(
        { riderId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();
  }
}
