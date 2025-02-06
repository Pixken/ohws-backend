import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { CashModule } from './modules/cash/cash.module';

@Module({
  imports: [PrismaModule, UserModule, CashModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
