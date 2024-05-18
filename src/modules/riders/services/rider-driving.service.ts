import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Riders } from '../entities/riders.entity';
import { UpdateRiderDrivingPreferenceDto } from '../dtos/update-rider-driving-preference.dto';
import { UpdateRiderDrivingLicenseDto } from '../dtos/update-rider-driving-license.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class RiderDrivingService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Riders)
    private ridersRepository: Repository<Riders>,
  ) {}

  async updateDrivingPreferences(
    updateRiderDrivingPreferenceDto: UpdateRiderDrivingPreferenceDto,
  ): Promise<Riders> {
    const rider_id = this.request['user'].id;
    const rider = await this.ridersRepository.findOne({
      where: { id: rider_id },
    });
    if (!rider) {
      throw new NotFoundException(`Rider with ID ${rider_id} not found`);
    }

    Object.assign(rider, updateRiderDrivingPreferenceDto);

    return this.ridersRepository.save(rider);
  }

  async updateDrivingLicense(
    updateRiderDrivingLicenseDto: UpdateRiderDrivingLicenseDto,
    driving_license_image?: Express.Multer.File,
    driving_verification_selfie_image?: Express.Multer.File,
  ): Promise<Riders> {
    const rider_id = this.request['user'].id;
    const rider = await this.ridersRepository.findOne({
      where: { id: rider_id },
    });
    if (!rider) {
      throw new NotFoundException(`Rider with ID ${rider_id} not found`);
    }

    if (driving_license_image) {
      // Assuming you have some logic to handle file upload and storage
      // e.g., saving the file to a storage service and getting the URL
      rider.driving_license_image_url = 'path/to/uploaded/license_image';
    }

    if (driving_verification_selfie_image) {
      // Similarly, handle the selfie image file
      rider.profile_image_url = 'path/to/uploaded/verification_selfie_image';
    }

    Object.assign(rider, updateRiderDrivingLicenseDto);

    return this.ridersRepository.save(rider);
  }
}
