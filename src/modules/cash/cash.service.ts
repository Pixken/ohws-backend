import { Injectable } from '@nestjs/common';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as dayjs from 'dayjs';
@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService, private readonly eventEmitter: EventEmitter2) {}

  async create(createCashDto: CreateCashDto) {
    const price = createCashDto.cash.price;
    const type = createCashDto.cash.type;
    const account = await this.prisma.account.findUnique({ where: { id: createCashDto.accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    console.log( account.balance);
    
    const newBalance = type === 'income' ? account.balance + price : account.balance - price;
    // 使用事务来确保更新操作被正确捕获
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where: { id: createCashDto.accountId },
        data: { balance: newBalance }
      });
      console.log('事务中更新结果:', updatedAccount);
      return updatedAccount;
    });
    const iconArr = await this.eventEmitter.emitAsync('getIcon', createCashDto.cash.description);
    return await this.prisma.cash.create({ data: { ...createCashDto.cash, accountId: createCashDto.accountId, userId: createCashDto.userId, icon: iconArr[0].split('------')[0], color: iconArr[0].split('------')[1] }, include: { category: true, account: true } });
  }

  async findAllByUser(userId: string) {
    return await this.prisma.cash.findMany({ where: { userId } });
  }

  async findAllByAccount(accountId: string) {
    return await this.prisma.cash.findMany({ where: { accountId } });
  }

  async findAllByTime(userId: string, time: string[], accountId?: string, categoryId?: string, type?: string) {
    return await this.prisma.cash.findMany({
      where: {
        userId,
        date: {
          gte: dayjs(time[0]).startOf('day').toDate(),
          lte: dayjs(time[1]).endOf('day').toDate(),
        },
        accountId,
        categoryId,
        type,
      },
      include: {
        category: true,
        account: true,
      },
    });
  }

  findAll() {
    return `This action returns all cash`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cash `;
  }

  update(id: number, updateCashDto: UpdateCashDto) {
    return `This action updates a #${id} cash`;
  }

  remove(id: number) {
    return `This action removes a #${id} cash`;
  }
}
