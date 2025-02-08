import { Module } from '@nestjs/common';
import { CashCategoryService } from './cash-category.service';
import { CashCategoryController } from './cash-category.controller';

@Module({
  controllers: [CashCategoryController],
  providers: [CashCategoryService],
})
export class CashCategoryModule {}
