import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { CashModule } from './modules/cash/cash.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './modules/account/account.module';
import { CashCategoryModule } from './modules/cash-category/cash-category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule, UserModule, CashModule, AuthModule, AccountModule, CashCategoryModule
  ],
})
export class AppModule { }
