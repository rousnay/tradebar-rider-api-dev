import { ApiProperty, PartialType } from '@nestjs/swagger';
import { SingleDeviceNotificationDto } from './single-device-notification.dto';

export class MultipleDevicesNotificationDto extends PartialType(
  SingleDeviceNotificationDto,
) {
  @ApiProperty({
    description: 'Device tokens to send the notification to',
    example: ['device_token1', 'device_token2'],
    type: [String],
  })
  tokens: string[];
}
