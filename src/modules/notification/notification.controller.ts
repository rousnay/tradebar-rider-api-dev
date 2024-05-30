import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseAdminService } from 'src/services/firebase-admin.service';
import { SingleDeviceNotificationDto } from './dtos/single-device-notification.dto';
import { MultipleDevicesNotificationDto } from './dtos/multiple.devices.notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('device')
  @ApiOperation({ summary: 'Send a notification to a single device' })
  @ApiResponse({
    status: 201,
    description: 'Notification sent and stored successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async sendNotificationToSingleDevice(
    @Body() singleDeviceNotificationDto: SingleDeviceNotificationDto,
  ) {
    const payload = {
      notification: {
        title: singleDeviceNotificationDto.title,
        body: singleDeviceNotificationDto.message,
      },
      data: singleDeviceNotificationDto.data
        ? { customData: singleDeviceNotificationDto.data }
        : undefined,
    };

    // Send the notification to a single device
    const response =
      await this.firebaseAdminService.sendNotificationToSingleDevice(
        singleDeviceNotificationDto.token,
        payload,
      );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      singleDeviceNotificationDto.userId,
      singleDeviceNotificationDto.title,
      singleDeviceNotificationDto.message,
      singleDeviceNotificationDto.data,
    );

    return { message: 'Notification sent and stored', response };
  }

  @Post('multiple-devices')
  @ApiOperation({ summary: 'Send a notification to multiple devices' })
  @ApiResponse({
    status: 201,
    description: 'Notifications sent and stored successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async sendNotification(
    @Body() multipleDevicesNotificationDto: MultipleDevicesNotificationDto,
  ) {
    const payload = {
      notification: {
        title: multipleDevicesNotificationDto.title,
        body: multipleDevicesNotificationDto.message,
      },
      data: multipleDevicesNotificationDto.data
        ? { customData: multipleDevicesNotificationDto.data }
        : undefined,
    };

    // Send the notification to multiple devices
    const response =
      await this.firebaseAdminService.sendNotificationToMultipleDevice(
        multipleDevicesNotificationDto.tokens,
        payload,
      );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      multipleDevicesNotificationDto.userId,
      multipleDevicesNotificationDto.title,
      multipleDevicesNotificationDto.message,
      multipleDevicesNotificationDto.data,
    );

    return { message: 'Notifications sent and stored', response };
  }

  @Post('delivery-request')
  @ApiOperation({
    summary: 'Send a delivery request notification to all riders',
  })
  @ApiResponse({
    status: 201,
    description: 'Delivery request notifications sent and stored successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async sendDeliveryRequestToAllRiders(
    @Body() multipleDevicesNotificationDto: MultipleDevicesNotificationDto,
  ) {
    const payload = {
      notification: {
        title: multipleDevicesNotificationDto.title,
        body: multipleDevicesNotificationDto.message,
      },
      data: multipleDevicesNotificationDto.data
        ? { customData: multipleDevicesNotificationDto.data }
        : undefined,
    };

    // Send the notification to all riders
    const response =
      await this.firebaseAdminService.sendNotificationToMultipleDevice(
        multipleDevicesNotificationDto.tokens,
        payload,
      );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      multipleDevicesNotificationDto.userId,
      multipleDevicesNotificationDto.title,
      multipleDevicesNotificationDto.message,
      multipleDevicesNotificationDto.data,
    );

    return {
      message: 'Delivery request notifications sent and stored',
      response,
    };
  }
}
