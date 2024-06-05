import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
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

  async getDeliveryRequestById(id: string): Promise<Delivery> {
    try {
      return await this.deliveryModel.findById(id).exec();
    } catch (error) {
      throw new Error(`Error fetching delivery request: ${error.message}`);
    }
  }

  async acceptDeliveryRequest(id: number): Promise<any> {
    try {
      return await this.entityManager.query(
        `UPDATE deliveries SET shipping_status = 'accepted' WHERE id = ${id}`,
      );
    } catch (error) {
      throw new Error(`Error accepting delivery request: ${error.message}`);
    }
  }
}
