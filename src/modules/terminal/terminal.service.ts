import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Client as SSHClient } from 'ssh2';

interface MachineConfig {
  host: string;
  username: string;
  password: string;
}

@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);

  createConnection(machineConfig: MachineConfig, socket: Socket) {
    const ssh = new SSHClient();
    const { host, username, password } = machineConfig;

    ssh.on('ready', () => {
      console.log('SSH Connection Success');
      socket.send('\r\n*** SSH CONNECTION SUCCESS ***\r\n');

      ssh.shell((err, stream) => {
        if (err) {
          return socket.send('\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
        }

        socket.on('terminal:input', (data) => {
          console.log('data', data);
          stream.write(data.input + '\r');
        });

        stream.on('data', (data: Buffer) => {
          console.log('data', data.toString('utf-8'));
          socket.emit('terminal:output', { data: data.toString('utf-8') });
        });

        stream.on('close', () => {
          ssh.end();
        });
      });
    });

    ssh.on('close', () => {
      socket.send('\r\n*** SSH CONNECTION CLOSED ***\r\n');
    });

    ssh.on('error', (err) => {
      this.logger.error(`SSH Connection Error: ${err.message}`);
      socket.send('\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
    });

    ssh.connect({
      port: 22,
      host,
      username,
      password
    });

    return ssh;
  }
}