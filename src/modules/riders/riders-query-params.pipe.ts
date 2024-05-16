import { Injectable, BadRequestException } from '@nestjs/common';
import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { RidersQueryParamsDto } from './dtos/riders-query-params.dto';

@Injectable()
export class RiderQueryParamsPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const queryDto = plainToClass(RidersQueryParamsDto, value);

    const errors = await validate(queryDto, { whitelist: true }); // Using whitelist to strip non-whitelisted properties

    if (errors.length > 0) {
      const errorMessage = errors
        .map((err) => Object.values(err.constraints))
        .join(', ');
      throw new BadRequestException(`Validation failed: ${errorMessage}`);
    }

    return queryDto;
  }
}
