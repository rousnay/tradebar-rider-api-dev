import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationService } from './location.service';
import { Injectable, Logger } from '@nestjs/common';
import { ShippingStatus } from '@common/enums/delivery.enum';
import { EntityManager } from 'typeorm';

@WebSocketGateway({
  cors: true,
})
@Injectable()
export class LocationGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('LocationGateway');

  constructor(
    private readonly locationService: LocationService,
    private readonly entityManager: EntityManager,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    client: Socket,
    payload: {
      riderId: number;
      latitude: number;
      longitude: number;
      // isActive?: boolean;
    },
  ) {
    const location = await this.locationService.updateLocation(
      payload.riderId,
      payload.latitude,
      payload.longitude,
      // payload.isActive,
    );

    //Use this.server.emit instead of client.emit to broadcast the update to all connected clients.
    this.server.emit('locationUpdated', location);
    this.server.emit(`locationUpdated_${payload.riderId}`, location);
  }

  @SubscribeMessage('getRiderLocation')
  async handleGetRiderLocation(client: Socket, payload: { riderId: number }) {
    const location = await this.locationService.getLocationByRiderId(
      payload.riderId,
    );
    client.emit('riderLocation', location);
  }

  @SubscribeMessage('updateOrderStatus')
  async onUpdateOrderStatus(@MessageBody() payload: { orderId: number }) {
    console.log(payload);
    const orderId = Number(payload.orderId);

    try {
      const delivery = await this.entityManager.query(
        'SELECT * FROM deliveries WHERE order_id = ?',
        [orderId],
      );

      if (!delivery || !delivery.length) {
        throw new Error('Delivery not found');
      }

      const { id, shipping_status } = delivery[0];
      let title = '';
      let message = '';

      switch (shipping_status) {
        case ShippingStatus.WAITING:
          title = 'Order waiting';
          message = 'Your order has been placed and waiting for confirmation';
          break;
        case ShippingStatus.SEARCHING:
          title = 'Searching for a rider';
          message = 'Be patient, we are searching for a rider for your order';
          break;
        case ShippingStatus.ACCEPTED:
          title = 'Order accepted';
          message =
            'Your order has been accepted, the rider is on the way to pickup';
          break;
        case ShippingStatus.REACHED_AT_PICKUP_POINT:
          title = 'The rider reached at pickup point';
          message = 'The rider is waiting for the order to be picked up.';
          break;
        case ShippingStatus.PICKED_UP:
          title = 'Order picked up';
          message =
            'The rider has picked up the order, and is on the way to delivery point';
          break;
        case ShippingStatus.REACHED_AT_DELIVERY_POINT:
          title = 'The rider reached at delivery point';
          message = 'The rider is waiting for the order to be delivered';
          break;
        case ShippingStatus.DELIVERED:
          title = 'Order delivered';
          message = 'The rider has delivered the order';
          break;
        case ShippingStatus.CANCELLED:
          title = 'Order cancelled';
          message = 'The delivery request has been cancelled';
          break;
        case ShippingStatus.EXPIRED:
          title = 'Order expired';
          message = 'The order has been expired';
          break;
        default:
          title = 'Order updated';
          message = 'The order has been updated';
          break;
      }

      console.log(
        'FROM WS:',
        `orderStatusUpdated_${orderId}`,
        'OrderId:',
        orderId,
        'DeliveryId:',
        id,
        'Order Status:',
        shipping_status,
        'Title:',
        title,
        'Message:',
        message,
      );

      const ongoingOrderStatus = await this.locationService.updateOngoingOrder(
        orderId,
        id,
        shipping_status,
        title,
        message,
      );

      this.server.emit(`orderStatusUpdated_${orderId}`, ongoingOrderStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Handle error as per your application's requirements
    }
  }
}
