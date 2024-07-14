import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ConfigService } from 'src/config/config.service';
import { Riders } from 'src/modules/riders/entities/riders.entity';
import { DeliveryRequest } from '@modules/delivery/schemas/delivery-request.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Riders)
    private riderRepository: Repository<Riders>,
    configService: ConfigService, // No need to declare it as private or readonly, Since configService is only needed in the constructor
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async validateUser(payload: any): Promise<any> {
    // Extract user id from the payload
    const rider_id = payload.sub;

    // Find the user in the database by userId
    const user = await this.riderRepository.findOne({
      where: { id: rider_id },
    });

    // get riders's overall review
    const given_to_id = user?.id;
    const result = await this.entityManager.query(
      'SELECT ROUND(AVG(rating), 1) as average_rating, COUNT(rating) as total_ratings FROM overall_reviews WHERE given_to_id = ?',
      [given_to_id],
    );

    const averageRating = result[0].average_rating || 0;
    const totalRatings = result[0].total_ratings || 0;

    const avg_rating = {
      average_rating: Number(averageRating),
      total_ratings: Number(totalRatings),
    };
    let ongoing_trip = null;
    const deliveriesData = await this.entityManager.query(
      'SELECT id,order_id,shipping_status FROM deliveries WHERE rider_id = ? AND shipping_status IN ("accepted","reached_at_pickup_point","picked_up","reached_at_delivery_point")',
      [rider_id],
    );

    if (deliveriesData.length > 0) {
      // find deliver request id
      const deliverRequestData = await this.deliveryRequestModel.find(
        {
          orderId: deliveriesData[0].order_id,
          deliveryId: deliveriesData[0].id,
        },
        {
          select: ['_id'],
        },
      );
      ongoing_trip = {
        order_id: deliveriesData[0].order_id || null,
        delivery_id: deliveriesData[0].id || null,
        shipping_status: deliveriesData[0].shipping_status || null,
        delivery_request_id:
          deliverRequestData.length > 0 ? deliverRequestData[0]._id : null,
      };
    }
    const addReview = { ...user, avg_rating, ongoing_trip };

    // If user is found, return the user, otherwise return null
    if (user) {
      return addReview;
    } else {
      return null;
    }
  }
}
