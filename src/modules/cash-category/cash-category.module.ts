import { Module } from '@nestjs/common';
import { CashCategoryService } from './cash-category.service';
import { CashCategoryController } from './cash-category.controller';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  controllers: [CashCategoryController],
  providers: [CashCategoryService, PrismaService],
  exports: [CashCategoryService],
})
export class CashCategoryModule {}
