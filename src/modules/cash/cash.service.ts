import { Injectable } from '@nestjs/common';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCashDto: CreateCashDto) {
    const price = createCashDto.cash.price;
    const account = await this.prisma.account.findUnique({ where: { id: createCashDto.accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    const newBalance = account.balance + price;
    await this.prisma.account.update({ where: { id: createCashDto.accountId }, data: { balance: newBalance } });
    return await this.prisma.cash.create({ data: createCashDto.cash });
  }

  async findAllByUser(userId: string) {
    return await this.prisma.cash.findMany({ where: { userId } });
  }

  async findAllByAccount(accountId: string) {
    return await this.prisma.cash.findMany({ where: { accountId } });
  }

  findAll() {
    return `This action returns all cash`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cash`;
  }

  update(id: number, updateCashDto: UpdateCashDto) {
    return `This action updates a #${id} cash`;
  }

  remove(id: number) {
    return `This action removes a #${id} cash`;
  }
}
