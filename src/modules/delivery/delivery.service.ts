import { Injectable } from '@nestjs/common';
import { LocationService } from '@modules/location/location.service';
import { EntityManager } from 'typeorm';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly entityManager: EntityManager,
    private locationService: LocationService,
  ) {}

  async getRiderDeviceTokens(
    riderIds: number[],
  ): Promise<{ riderId: number; deviceTokens: string[] }[]> {
    const userIdQuery = `
      SELECT id AS riderId, user_id AS userId
      FROM riders
      WHERE id IN (${riderIds.join(',')})
    `;

    const userMappings = await this.entityManager.query(userIdQuery);
    console.log('userMappings', userMappings);

    const userIds = userMappings.map((mapping) => mapping.userId);

    if (userIds.length === 0) {
      return [];
    }
    console.log('userIds', userIds);

    const deviceTokensQuery = `
      SELECT user_id AS userId, device_token AS deviceToken
      FROM user_device_tokens
      WHERE user_id IN (${userIds.join(',')})
    `;

    const deviceTokensMappings = await this.entityManager.query(
      deviceTokensQuery,
    );

    console.log('deviceTokensQuery', deviceTokensQuery);

    const userDeviceTokensMap = deviceTokensMappings.reduce((acc, token) => {
      if (!acc[token.userId]) {
        acc[token.userId] = [];
      }
      if (!acc[token.userId].includes(token.deviceToken)) {
        acc[token.userId].push(token.deviceToken);
      }
      return acc;
    }, {});

    console.log('userDeviceTokensMap', userDeviceTokensMap);

    const riderDeviceTokens = userMappings.map((mapping) => ({
      riderId: mapping.riderId,
      deviceTokens: userDeviceTokensMap[mapping.userId] || [],
    }));

    console.log('riderDeviceTokens', riderDeviceTokens);

    return riderDeviceTokens;
  }
}
