import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { CashModule } from './modules/cash/cash.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './modules/account/account.module';
import { CashCategoryModule } from './modules/cash-category/cash-category.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/auth.guard';
import { SshGateway } from './modules/terminal/terminal.gateway';
import { SshService } from './modules/terminal/terminal.service';
import { NotesModule } from './modules/notes/notes.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, UserModule, CashModule, AuthModule, AccountModule, CashCategoryModule, NotesModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    SshGateway,
    SshService,
  ],
})
export class AppModule { }
