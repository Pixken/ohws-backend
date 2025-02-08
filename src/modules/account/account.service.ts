import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async addAccount(userId: string, accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      throw new Error('Account not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { accounts: { connect: { id: accountId } } },
      include: { accounts: true },
    });
  }

  async createAccount(data: any) {
    return await this.prisma.account.create({
      data: {
        balance: data.balance,
        name: data.name,
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
}

