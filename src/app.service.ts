import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AppVariables } from '@common/utils/variables';

@Injectable()
export class AppService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHelloAsync(): Promise<string> {
    const rawQuery = `
        SELECT COUNT(*) AS total_riders
        FROM riders;
        `;

    const result = await this.entityManager.query(rawQuery);

    const tradebarFeePercentage = await AppVariables.tradebarFee.percentage;

    if (result.length === 0) {
      return null;
    }
    return (
      'Total riders: ' +
      result[0].total_riders +
      ', Tradebar Fee ' +
      tradebarFeePercentage +
      '%'
    );
  }
}
