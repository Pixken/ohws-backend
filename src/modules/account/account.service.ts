import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new account
   */
  async createAccount(userId: string, data: any): Promise<any> {
    // Validate required fields
    if (!data.name) {
      throw new Error('Account name is required');
    }
    
    if (!data.type) {
      throw new Error('Account type is required');
    }

    // Check if user exists
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    const initialBalance = data.initialBalance ? new Decimal(data.initialBalance) : new Decimal(0);
    const alertThreshold = data.alertThreshold ? new Decimal(data.alertThreshold) : null;

    const account = await this.prisma.account.create({
      data: {
        userId: userId,
        name: data.name,
        type: data.type,
        balance: initialBalance,
        icon: data.icon || null,
        color: data.color || null,
        isDefault: data.isDefault || false,
        alertThreshold: alertThreshold,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return this.convertToResponseDto(account);
  }

  /**
   * Find all accounts for a user (alias for getUserAccounts)
   */
  async findAccounts(userId: string): Promise<any[]> {
    return this.getUserAccounts(userId);
  }

  /**
   * Update an account
   */
  async updateAccount(accountId: number, data: any): Promise<any> {
    // Get current account to only update provided fields
    const currentAccount = await this.prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!currentAccount) {
      throw new Error('Account not found');
    }

    // Only update fields that are provided
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.balance !== undefined) updateData.balance = new Decimal(data.balance);
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.alertThreshold !== undefined) updateData.alertThreshold = new Decimal(data.alertThreshold);

    // If this account is set as default, unset other default accounts
    if (data.isDefault === true) {
      await this.prisma.account.updateMany({
        where: {
          userId: currentAccount.userId,
          id: { not: accountId }
        },
        data: {
          isDefault: false
        }
      });
    }

    const updatedAccount = await this.prisma.account.update({
      where: { id: accountId },
      data: updateData
    });

    return this.convertToResponseDto(updatedAccount);
  }

  /**
   * Delete an account
   */
  async deleteAccount(accountId: number): Promise<void> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Check if this is the only account for the user
    const accountCount = await this.prisma.account.count({
      where: { userId: account.userId }
    });

    if (accountCount <= 1) {
      throw new Error('Cannot delete the only account. User must have at least one account.');
    }

    // Delete related transactions
    await this.prisma.transaction.deleteMany({
      where: { accountId: accountId }
    });

    // Delete the account
    await this.prisma.account.delete({
      where: { id: accountId }
    });
  }

  /**
   * Get all accounts for a user
   */
  async getUserAccounts(userId: string): Promise<any[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId: userId }
    });

    return accounts.map(account => this.convertToResponseDto(account));
  }

  /**
   * Get account details
   */
  async getAccountDetail(accountId: number): Promise<any> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return this.convertToResponseDto(account);
  }

  /**
   * Convert account entity to DTO
   */
  private convertToResponseDto(account: any): any {
    return {
      id: account.id,
      userId: account.userId,
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      icon: account.icon,
      color: account.color,
      isDefault: account.isDefault,
      alertThreshold: account.alertThreshold ? Number(account.alertThreshold) : null,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }
}

