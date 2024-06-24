import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationService } from './location.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: true,
})
export class LocationGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('LocationGateway');

  constructor(private readonly locationService: LocationService) {}

  afterInit(server: Server) {
    // this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    // this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  async handleLocationUpdate(
    client: Socket,
    payload: {
      riderId: number;
      latitude: number;
      longitude: number;
      isActive?: boolean;
    },
  ) {
    const location = await this.locationService.updateLocation(
      payload.riderId,
      payload.latitude,
      payload.longitude,
      payload.isActive,
    );
    this.server.emit('locationUpdated', location);
  }
}
