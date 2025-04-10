import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CashCategoryService } from '../cash-category/cash-category.service';
import { CashService } from '../cash/cash.service';
import { AccountService } from '../account/account.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiV2Service } from './aiv2.service';
@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [AiController],
  providers: [AiService, PrismaService, CashCategoryService, CashService, AccountService, AiV2Service],
})
export class AiModule {}
