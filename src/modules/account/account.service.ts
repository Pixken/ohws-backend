import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async addAccount(userId: string, data: any) {
    const account = await this.prisma.account.findUnique({
      where: { id: data.key },
    });
    if (!account) {
      throw new Error('Account not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { accounts: { connect: { id: data.key } } },
      include: { accounts: true },
    });
  }

  async createAccount(data: any) {
    return await this.prisma.account.create({
      data: {
        balance: data.balance,
        cardNumber: data.cardNumber || null,
        cardType: data.cardType || null,
        name: data.name,
        updateTime: new Date(),
        users: {
          connect: { id: data.userId }
        }
      }
    })
  }

  async findAccounts(userId: string) {
    return this.prisma.account.findMany({
      where: { users: { some: { id: userId } } },
      include: { users: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.account.findUnique({ where: { id } });
  }
}

