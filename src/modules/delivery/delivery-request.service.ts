import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDeliveryRequestDto } from './dtos/update-delivery-request.dto';
import {
  DeliveryRequest,
  AssignedRider,
} from './schemas/delivery-request.schema';
import { DeliveryStatus } from '@common/enums/delivery.enum';
import { REQUEST } from '@nestjs/core';
import {
  DeliveryRequestNotification,
  DeliveryRequestNotificationModel,
} from '@modules/notification/notification.schema';

@Injectable()
export class DeliveryRequestService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
    @InjectModel(DeliveryRequestNotificationModel.modelName)
    private deliveryRequestNotificationModel: Model<DeliveryRequestNotification>,
  ) {}

  async findAll(): Promise<DeliveryRequest[]> {
    const userId = this.request['user'].user_id;
    const notifications = await this.deliveryRequestNotificationModel
      .find({ userId })
      .exec();

    const requestIds = notifications.map(
      (notification) => notification?.data?.requestId,
    );

    return this.deliveryRequestModel.find({ _id: { $in: requestIds } }).exec();
  }

  async findOne(id: string): Promise<DeliveryRequest> {
    return this.deliveryRequestModel.findById(id).exec();
  }

  async acceptDeliveryRequest(id: string, req: any): Promise<DeliveryRequest> {
    const deliveryRequest = await this.deliveryRequestModel.findById(id).exec();
    if (!deliveryRequest) {
      throw new NotFoundException('Delivery request not found');
    }

    // if (deliveryRequest.status !== DeliveryStatus.SEARCHING) {
    //   throw new BadRequestException(
    //     'Delivery request is not in searching status',
    //   );
    // }

    const rider = req.user;
    console.log('Rider #:', rider);
    const updateFields = {
      status: DeliveryStatus.ACCEPTED,
      assignedRider: {
        id: rider.id,
        name: `${rider.first_name} ${rider.last_name}`,
      },
    };

    return this.deliveryRequestModel
      .findByIdAndUpdate(id, updateFields, { new: true })
      .exec();
  }
}
