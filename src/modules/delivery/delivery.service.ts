import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, getConnection } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery } from './models/delivery.model';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectModel('Delivery') private readonly deliveryModel: Model<Delivery>,
  ) {}

  async getDeliveryRequests(): Promise<Delivery[]> {
    try {
      return await this.deliveryModel.find().exec();
    } catch (error) {
      throw new Error(`Error fetching delivery requests: ${error.message}`);
    }
  }

  async getDeliveryRequestById(id: number): Promise<Delivery> {
    try {
      return await this.deliveryModel.findById(id).exec();
    } catch (error) {
      throw new Error(`Error fetching delivery request: ${error.message}`);
    }
  }

  // async acceptDeliveryRequest(id: number): Promise<any> {
  //   try {
  //     return await this.entityManager.query(
  //       `UPDATE deliveries SET shipping_status = 'accepted' WHERE id = ${id}`,
  //     );
  //   } catch (error) {
  //     throw new Error(`Error accepting delivery request: ${error.message}`);
  //   }
  // }

  async acceptDeliveryRequest(id: number): Promise<any> {
    console.log('Service: acceptDeliveryRequest called with id:', id);
    try {
      const updateResult = await this.entityManager.query(
        `UPDATE deliveries SET shipping_status = 'accepted' WHERE id = 4`,
        [id],
      );

      console.log('Update Result:', updateResult);

      // // Perform the update and log the result
      // const updateResult = await this.entityManager
      //   .createQueryBuilder()
      //   .update('deliveries')
      //   .set({ shipping_status: 'accepted' })
      //   .where('id = :id', { id })
      //   .execute();

      // console.log('Update Result:', updateResult);

      // // Retrieve the updated row
      // const updatedRow = await this.entityManager
      //   .createQueryBuilder('deliveries')
      //   .where('id = :id', { id })
      //   .getOne();

      // console.log('Updated Row:', updatedRow);

      // return updatedRow;

      // Retrieve the updated row
      const updatedRow = await this.entityManager.query(
        `SELECT * FROM deliveries WHERE id = ?`,
        [id],
      );

      return updatedRow[0];
    } catch (error) {
      throw new Error(`Error accepting delivery request: ${error.message}`);
    }
  }
}
