import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetAlertService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a budget alert
   */
  async createBudgetAlert(userId: string, data: any) {
    // Validate required fields
    if (!data.accountId) throw new Error('Account ID is required');
    if (!data.message) throw new Error('Alert message is required');
    if (!data.threshold) throw new Error('Threshold is required');
    if (!data.currentBalance) throw new Error('Current balance is required');
    if (!data.status) throw new Error('Status is required');

    const accountId = parseInt(data.accountId);
    const threshold = new Decimal(data.threshold);
    const currentBalance = new Decimal(data.currentBalance);

    // Verify account belongs to user
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId
      }
    });

    if (!account) {
      throw new Error('Account not found or does not belong to user');
    }

    // Create alert
    return await this.prisma.budgetAlert.create({
      data: {
        id: uuidv4(),
        userId: userId,
        accountId: accountId,
        message: data.message,
        threshold: threshold,
        currentBalance: currentBalance,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get all budget alerts for a user
   */
  async getUserBudgetAlerts(userId: string) {
    return await this.prisma.budgetAlert.findMany({
      where: { userId: userId },
      include: { account: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get alert by ID
   */
  async getBudgetAlertDetail(alertId: string) {
    const alert = await this.prisma.budgetAlert.findUnique({
      where: { id: alertId },
      include: { account: true }
    });

    if (!alert) {
      throw new Error('Budget alert not found');
    }

    return alert;
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(userId: string, alertId: string, status: string) {
    // Verify alert belongs to user
    const alert = await this.prisma.budgetAlert.findFirst({
      where: {
        id: alertId,
        userId: userId
      }
    });

    if (!alert) {
      throw new Error('Budget alert not found or does not belong to user');
    }

    // Update status
    return await this.prisma.budgetAlert.update({
      where: { id: alertId },
      data: {
        status: status,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete alert
   */
  async deleteBudgetAlert(userId: string, alertId: string) {
    // Verify alert belongs to user
    const alert = await this.prisma.budgetAlert.findFirst({
      where: {
        id: alertId,
        userId: userId
      }
    });

    if (!alert) {
      throw new Error('Budget alert not found or does not belong to user');
    }

    // Delete alert
    await this.prisma.budgetAlert.delete({
      where: { id: alertId }
    });
  }
} 