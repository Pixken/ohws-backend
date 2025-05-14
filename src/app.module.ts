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
import { AiModule } from './modules/ai/ai.module';
import { EventsModule } from './modules/events/events.module';
import { BudgetAlertModule } from './modules/budget-alert/budget-alert.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule, 
    UserModule, 
    CashModule, 
    AuthModule, 
    AccountModule, 
    CashCategoryModule, 
    AiModule, 
    EventsModule,
    BudgetAlertModule,
    StatisticsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
