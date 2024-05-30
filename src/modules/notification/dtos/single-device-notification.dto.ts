import { ApiProperty } from '@nestjs/swagger';

export class SingleDeviceNotificationDto {
  @ApiProperty({
    description: 'User ID of the recipient',
    example: 'user123',
  })
  userId: string;

  @ApiProperty({
    description: 'Device token to send the notification to',
    example: 'device_token',
  })
  token: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Personal Notification',
  })
  title: string;

  @ApiProperty({
    description: 'Message body of the notification',
    example: 'This is a personal notification just for you!',
  })
  message: string;

  @ApiProperty({
    description: 'Additional data for the notification',
    example: 'Some additional data',
    required: false,
  })
  data?: string;
}
