import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import {
  DeliveryRequest,
  AssignedRider,
} from './schemas/delivery-request.schema';
import { DeliveryStatus } from '@common/enums/delivery.enum';

@Injectable()
export class DeliveryRequestService {
  constructor(
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
  ) {}

  async findAll(): Promise<DeliveryRequest[]> {
    return this.deliveryRequestModel.find().exec();
  }

  async findOne(id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestModel.findById(id).exec();
  }

  async updateStatus(
    id: string,
    status: DeliveryStatus,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async updateAssignedRider(
    id: string,
    assignedRider: AssignedRider,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, { assignedRider }, { new: true })
      .exec();
  }

  async partialUpdate(
    id: string,
    updateData: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequest> {
    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }
}
