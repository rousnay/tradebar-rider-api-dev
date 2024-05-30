import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location } from './schemas/location.schema';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel('Location') private locationModel: Model<Location>,
  ) {}

  async updateLocation(
    riderId: string,
    latitude: number,
    longitude: number,
  ): Promise<Location> {
    return this.locationModel
      .findOneAndUpdate(
        { riderId },
        { latitude, longitude, updatedAt: new Date() },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getLocation(riderId: string): Promise<Location> {
    return this.locationModel.findOne({ riderId }).exec();
  }
}
