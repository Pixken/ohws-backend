import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CashCategoryService } from '../cash-category/cash-category.service';
import { CashService } from '../cash/cash.service';
import { AccountService } from '../account/account.service';
@Module({
  controllers: [AiController],
  providers: [AiService, PrismaService, CashCategoryService, CashService, AccountService],
})
export class AiModule {}
