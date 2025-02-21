import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as ssh2 from 'ssh2';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TerminalGateway {
  @WebSocketServer()
  server: Server;

  private connections: Map<string, ssh2.Client> = new Map();

  @SubscribeMessage('terminal:connect')
  async handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { host: string; port: number; username: string; password: string }
  ) {
    console.log('handleConnection', data);
    const sshClient = new ssh2.Client();

    try {
      await new Promise((resolve, reject) => {
        sshClient
          .on('ready', () => {
            sshClient.shell({ term: 'xterm-color' }, (err, stream) => {
              if (err) reject(err);

              stream.on('data', (data: Buffer) => {
                client.emit('terminal:output', { data: data.toString('utf-8') });
              });

              stream.on('close', () => {
                client.emit('terminal:close');
                this.connections.delete(client.id);
                sshClient.end();
              });

              this.connections.set(client.id, sshClient);
              resolve(stream);
            });
          })
          .on('error', (err) => {
            reject(err);
          })
          .connect({
            host: data.host,
            port: data.port,
            username: data.username,
            password: data.password
          });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('terminal:input')
  handleInput(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { input: string }
  ) {
    console.log('handleInput', data);
    const sshClient = this.connections.get(client.id);
    if (sshClient) {
      sshClient.exec(data.input, (err, stream) => {
        if (err) {
          client.emit('terminal:error', { error: err.message });
          return;
        }

        stream.on('data', (data: Buffer) => {
          client.emit('terminal:output', { data: data.toString('utf-8') });
        });
      });
    }
  }

  handleDisconnect(client: Socket) {
    const sshClient = this.connections.get(client.id);
    if (sshClient) {
      sshClient.end();
      this.connections.delete(client.id);
    }
  }
}