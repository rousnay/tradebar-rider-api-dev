import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Req,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { EntityManager, Repository } from 'typeorm';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { Riders } from '@modules/riders/entities/riders.entity';
import { ReviewService } from '@modules/review/review.service';
import { RidersService } from '../riders/services/riders.service';
import { MailService } from '@services/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { DeliveryRequest } from '@modules/delivery/schemas/delivery-request.schema';
import { Model } from 'mongoose';
import { AppConstants } from '@common/constants/constants';

@Injectable()
export class AuthService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private jwtService: JwtService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Riders)
    private riderRepository: Repository<Riders>,
    private reviewService: ReviewService,
    private ridersService: RidersService,
    private readonly mailService: MailService,
    @InjectModel(DeliveryRequest.name)
    private deliveryRequestModel: Model<DeliveryRequest>,
  ) {}

  async registration(
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    // password_confirmation: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('first_name', first_name);
      formData.append('last_name', last_name);
      formData.append('email', email);
      formData.append('phone', phone);
      // formData.append('password_confirmation', password_confirmation);
      formData.append('user_type', 'rider');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to register the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/register',
        formData,
        config,
      );

      // Success response
      return {
        status: 'success',
        message: response?.data?.msg,
        data: response?.data?.data,
      };
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async verifyEmailWithOTP(session_id: string, otp: string): Promise<any> {
    try {
      // Generate OTP logic here (e.g., using a library like speakeasy or generating a random number)

      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('otp', otp);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/validate-otp',
        formData,
        config,
      );

      console.log('Email OTP response: ', response?.data);
      // return response?.data;
      if (response.status === 200 || response.status === 201) {
        // Success response
        const userData = response?.data?.data?.user;

        // Create a new Riders entity
        const newRider = Riders.create({
          user_id: userData?.id,
          first_name: userData?.first_name,
          last_name: userData?.last_name,
          phone: userData?.phone,
          email: userData?.email,
          registration_date: userData?.created_at,
        });

        // Save the new Rider entity to the database
        const savedRider = await newRider.save();

        // Return the registration data along with the newly created Rider entity
        return {
          status: 'success',
          message: 'OTP verified successfully',
          data: {
            session_id: session_id,
            // user: response?.data?.data?.user,
            rider: savedRider,
          },
        };
      } else {
        return response.data;
        // Unexpected response format
        // throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        // console.error('Error registering user:', error);
        // console.error('Error generating OTP:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async setPassword(
    session_id: string,
    password: string,
    password_confirmation: string,
    device_token: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);
      formData.append('device_token', device_token);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/set-password',
        formData,
        config,
      );

      // Assuming Laravel returns the authenticated user data
      if (response.status === 200 || response.status === 201) {
        const user_id = await response?.data?.data?.user.id;
        if (user_id) {
          //get rider data by user_id
          const rider = await this.riderRepository.findOne({
            where: { user_id: user_id },
          });

          // console.log(user_id);
          // console.log(rider.id);

          const payload = { username: rider.email, sub: rider.id };
          const access_token = this.jwtService.sign(payload);

          //get rider's overall review
          const avg_rating = await this.reviewService.getAverageRating(
            rider?.id,
          );
          const ongoing_trip = await this.ridersService.getRiderOnGoingTrip(
            rider?.id,
          );
          return {
            status: 'success',
            message: response?.data?.msg,
            data: {
              // user: user,
              rider: { ...rider, avg_rating, ongoing_trip },
              access_token: access_token,
              // auth_token: response?.data?.data?.auth_token,
            },
          };
        } else {
          return response?.data;
          // Unexpected response format
          // throw new Error('Unexpected response format');
        }
      } else {
        return response.data;
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async login(
    identity: string,
    password: string,
    // user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('password', password);
      formData.append('user_type', 'rider');

      // console.log(formData);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/login',
        formData,
        config,
      );

      // Success response

      return {
        status: 'success',
        message: response?.data?.msg,
        data: response?.data?.data,
      };
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async verifyLoginWithOTP(
    session_id: string,
    otp: string,
    device_token: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('otp', otp);
      formData.append('device_token', device_token);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/verify-login-otp',
        formData,
        config,
      );

      console.log('Login OTP response: ', response?.data);

      // return response?.data;
      if (response.status === 200 || response.status === 201) {
        // Success response
        const user_id = await response?.data?.data?.user.id;

        if (user_id) {
          // console.log(user_id);
          //get rider data by user_id
          const rider = await this.riderRepository.findOne({
            where: { user_id: user_id },
          });

          const payload = { username: rider.email, sub: rider.id };
          const access_token = this.jwtService.sign(payload);

          //get rider's overall review
          const avg_rating = await this.reviewService.getAverageRating(
            rider?.id,
          );
          const ongoing_trip = await this.ridersService.getRiderOnGoingTrip(
            rider?.id,
          );
          return {
            status: 'success',
            message: response?.data?.msg,
            data: {
              // user: user,
              // rider: rider,
              rider: { ...rider, avg_rating, ongoing_trip },
              access_token: access_token,
              // auth_token: response?.data?.data?.auth_token,
            },
          };
        } else {
          return response?.data;
          // Unexpected response format
          // throw new Error('Unexpected response format');
        }
      } else {
        return response.data;
        // Unexpected response format
        // throw new Error('Unexpected response format');
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        // console.error('Error registering user:', error);
        console.error('Error generating OTP:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async forgetPassword(identity: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('identity', identity);
      formData.append('user_type', 'rider');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to forget-password the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/forget-password',
        formData,
        config,
      );

      // Success response
      return {
        status: 'success',
        message: response?.data?.msg,
        data: response?.data?.data,
      };
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async resetPassword(
    session_id: string,
    otp: string,
    password: string,
    password_confirmation: string,
    // user_type: string,
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('session_id', session_id);
      formData.append('otp', otp);
      formData.append('password', password);
      formData.append('password_confirmation', password_confirmation);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to authenticate the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/reset-password',
        formData,
        config,
      );

      // Assuming Laravel returns the authenticated user data
      if (response.status === 200 || response.status === 201) {
        // Success response
        const user = await response?.data?.data?.user;

        //get rider data by user_id
        const rider = await this.riderRepository.findOne({
          where: { user_id: user?.id },
        });
        const ongoing_trip = await this.ridersService.getRiderOnGoingTrip(
          rider?.id,
        );
        return {
          status: 'success',
          message: response?.data?.msg,
          data: {
            // user: user,
            rider: {
              ...rider,
              ongoing_trip,
            },
          },
        };
      } else {
        return response.data;
      }
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message: [
              error.response.data.error.message ||
                error.response.statusText ||
                'Internal server error',
            ],
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async resentOTP(session_id: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('session_id', session_id);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Make a request to your Laravel backend to forget-password the user
      const response = await axios.post(
        AppConstants.appServices.laravelServerBaseUrl +
          '/api/v1/user/auth/resend-otp',
        formData,
        config,
      );

      // Success response
      return {
        status: 'success',
        message: response?.data?.msg,
        data: {
          session_id: session_id,
        },
      };
    } catch (error) {
      // Handle error
      if (error.response && error.response.status) {
        throw new HttpException(
          {
            statusCode: error.response.status,
            message:
              error.response.data.error.message ||
              error.response.statusText ||
              'Internal server error',
            error: error.response.statusText,
          },
          error.response.status,
        );
      } else {
        console.error('Error registering user:', error);
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getLoggedInUserId(): Promise<number> {
    const authorizationHeader = this.request.headers['authorization'];
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    try {
      const decoded = this.jwtService.verify(token);

      const {
        payload: { sub },
      } = decoded;

      return sub;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async getLoggedInUserInfo(authorizationHeader: string): Promise<any> {
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    try {
      const decoded = this.jwtService.verify(token);

      const {
        payload: { username, sub },
      } = decoded;

      const query = `
      SELECT * FROM users WHERE id = ?
    `;

      const users = await this.entityManager
        .query(query, [sub])
        .catch((error) => {
          console.error('Error executing query:', error);
        });
      // console.log('test1');
      if (users.length === 0) {
        return null;
      }

      return {
        data: {
          ...users[0],
        },
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async removeDeviceToken(
    req: any,
    device_token: string,
  ): Promise<{ message: string }> {
    const userId = req.user.user_id;

    // console.log(userId, device_token);

    const sql = `
    DELETE FROM user_device_tokens
    WHERE user_id = ? AND device_token = ?
  `;

    try {
      const result = await this.entityManager.query(sql, [
        userId,
        device_token,
      ]);

      if (result.affectedRows === 0) {
        return { message: 'No matching device token found for the user.' };
      }

      return { message: 'Device token removed successfully.' };
    } catch (error) {
      console.error('Error removing device token:', error);
      throw new Error('Failed to remove device token');
    }
  }

  async getLoggedInRiderInfo(authorizationHeader: string): Promise<any> {
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const [type, token] = authorizationHeader.split(' ');

    if (type !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    try {
      const decoded = this.jwtService.verify(token);

      // console.log(decoded);

      const {
        payload: { username, sub },
      } = decoded;

      const query = `
      SELECT * FROM riders WHERE id = ?
    `;

      const users = await this.entityManager
        .query(query, [sub])
        .catch((error) => {
          console.error('Error executing query:', error);
        });
      // console.log('test1');
      if (users.length === 0) {
        return null;
      }

      return {
        data: {
          ...users[0],
        },
      };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async validateUser(payload: any): Promise<any> {
    // Extract user id from the payload
    const rider_id = payload.sub;

    // Find the user in the database by userId
    const user = await this.riderRepository.findOne({
      where: { id: rider_id },
    });

    // If user is found, return the user, otherwise return null
    if (user) {
      return user;
    } else {
      return null;
    }
  }
}
