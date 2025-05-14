import { Module } from '@nestjs/common';
import { BudgetAlertController } from './budget-alert.controller';
import { BudgetAlertService } from './budget-alert.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BudgetAlertController],
  providers: [BudgetAlertService],
  exports: [BudgetAlertService]
})
export class BudgetAlertModule {} 