import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { SshService } from './terminal.service';
import { Logger } from '@nestjs/common';

interface ConnectDto {
  host: string;
  username: string;
  password: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SshGateway.name);
  private connections = new Map<string, any>();

  constructor(private readonly sshService: SshService) {}

  @WebSocketServer()
  server: any;

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const sshClient = this.connections.get(client.id);
    if (sshClient) {
      sshClient.end();
      this.connections.delete(client.id);
    }
  }

  @SubscribeMessage('terminal:connect')
  handleSshConnection(@MessageBody() payload: ConnectDto, @ConnectedSocket() client: any) {
    console.log('payload', payload, client);
    const sshClient = this.sshService.createConnection(payload, client);
    this.connections.set(client.id, sshClient);
    return { success: true };
  }
}