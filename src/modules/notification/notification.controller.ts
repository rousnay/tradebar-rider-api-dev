import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseAdminService } from 'src/services/firebase-admin.service';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('send')
  async sendNotification(
    @Body()
    body: {
      userId: string;
      tokens: string[];
      title: string;
      message: string;
      data?: string;
    },
  ) {
    const payload = {
      notification: {
        title: body.title,
        body: body.message,
      },
      data: body.data ? { customData: body.data } : undefined,
    };

    // Send the notification
    const response = await this.firebaseAdminService.sendNotification(
      body.tokens,
      payload,
    );

    // Log or handle the response if needed
    console.log('FCM Response:', response);

    // Store the notification
    await this.notificationService.createNotification(
      body.userId,
      body.title,
      body.message,
      body.data,
    );

    return { message: 'Notification sent and stored', response };
  }
}
