import { Module } from '@nestjs/common';
import { SshGateway } from './terminal.gateway';
import { SshService } from './terminal.service';
@Module({
  providers: [SshGateway, SshService],
})
export class TerminalModule {}