import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
@Injectable()
export class CloudFlareMediaService {
  private readonly cfAccId = process.env.CLOUDFLARE_ACCOUNT_ID;
  private readonly cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  private readonly cfAccountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
  private readonly cfVariant = 'public';
  private readonly cfGetApiUrl = 'https://imagedelivery.net';
  private readonly cfPostApiBaseUrl =
    'https://api.cloudflare.com/client/v4/accounts';
  constructor(
    private readonly entityManager: EntityManager,
    private readonly httpService: HttpService,
  ) {}

  async uploadMedia(file: Express.Multer.File, args: any): Promise<any> {
    const imageTypes = ['regular', 'cover', 'thumbnail'];
    const imageType =
      args.image_type && imageTypes.includes(args.image_type)
        ? args.image_type
        : 'regular';

    const attributes = {
      model: args.model,
      model_id: args.model_id,
      image_type: imageType,
      ...args,
    };

    const filename = Date.now() + '-' + file.originalname.split('.').pop();

    const postUrl = `${this.cfPostApiBaseUrl}/${this.cfAccId}/images/v1`;
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    try {
      const response = await firstValueFrom(
        this.httpService.post(postUrl, formData, {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${this.cfApiToken}`,
          },
        }),
      );

      if (response.status === 200) {
        const cf_id = await response?.data?.result?.id;
        const insertResult = await this.entityManager
          .createQueryBuilder()
          .insert()
          .into('cf_media')
          .values({
            ...attributes,
            original_name: file.originalname,
            extension: file.originalname.split('.').pop(),
            type: file.mimetype,
            size: file.size,
            cloudflare_id: cf_id,
            file: filename,
          })
          .execute();

        const insertedId = await insertResult?.raw?.insertId;

        const cfMedia = await this.entityManager
          .createQueryBuilder()
          .select(['cf.*'])
          .from('cf_media', 'cf')
          .where('cf.id = :id', { id: insertedId })
          .getRawOne();

        const media_url =
          this.cfGetApiUrl +
          '/' +
          this.cfAccountHash +
          '/' +
          cf_id +
          '/' +
          this.cfVariant;

        return {
          message: 'Media has been uploaded successfully',
          data: {
            ...cfMedia,
            media_url,
          },
        };
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
