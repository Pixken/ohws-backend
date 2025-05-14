import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取用户在指定日期范围内的月度统计数据
   */
  async getMonthlyStatistics(userId: string, startDate: Date, endDate: Date) {
    // 获取指定日期范围内的所有交易
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // 按年月分组统计
    const monthlyStats = new Map<string, { 
      year: number; 
      month: number; 
      income: Decimal; 
      expense: Decimal; 
      balance: Decimal; 
    }>();

    // 处理每笔交易
    for (const transaction of transactions) {
      const date = transaction.transactionDate;
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript 月份从 0 开始
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

      // 获取或创建当月统计数据
      if (!monthlyStats.has(yearMonth)) {
        monthlyStats.set(yearMonth, {
          year,
          month,
          income: new Decimal(0),
          expense: new Decimal(0),
          balance: new Decimal(0)
        });
      }

      const stats = monthlyStats.get(yearMonth);

      // 根据交易类型更新统计数据
      if (transaction.type === 'income') {
        stats.income = stats.income.add(transaction.amount);
      } else if (transaction.type === 'expense') {
        stats.expense = stats.expense.add(transaction.amount);
      }
    }

    // 计算余额并转换为数组
    const result = Array.from(monthlyStats.values()).map(stats => {
      // 计算余额
      stats.balance = stats.income.sub(stats.expense);
      
      // 转换 Decimal 为数字
      return {
        year: stats.year,
        month: stats.month,
        income: Number(stats.income),
        expense: Number(stats.expense),
        balance: Number(stats.balance)
      };
    });

    // 按年月排序
    result.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });

    return result;
  }

  /**
   * 获取指定日期范围内的交易按类别分组统计
   */
  async getTransactionsByCategory(userId: string, startDate: Date, endDate: Date) {
    // 获取指定日期范围内的所有交易
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        category: true
      }
    });

    // 将交易分为支出和收入两类
    const expense = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    // 按类别统计支出
    const expenseByCategory = new Map<string, {
      categoryId: string;
      categoryName: string;
      amount: Decimal;
      count: number;
      percentage: number;
    }>();

    // 按类别统计收入
    const incomeByCategory = new Map<string, {
      categoryId: string;
      categoryName: string;
      amount: Decimal;
      count: number;
      percentage: number;
    }>();

    // 计算总支出和总收入
    let totalExpense = new Decimal(0);
    let totalIncome = new Decimal(0);

    // 统计支出
    for (const transaction of expense) {
      totalExpense = totalExpense.add(transaction.amount);
      
      const categoryId = transaction.categoryId.toString();
      const categoryName = transaction.category?.name || 'Unknown';
      
      if (!expenseByCategory.has(categoryId)) {
        expenseByCategory.set(categoryId, {
          categoryId,
          categoryName,
          amount: new Decimal(0),
          count: 0,
          percentage: 0
        });
      }
      
      const stats = expenseByCategory.get(categoryId);
      stats.amount = stats.amount.add(transaction.amount);
      stats.count += 1;
    }

    // 统计收入
    for (const transaction of income) {
      totalIncome = totalIncome.add(transaction.amount);
      
      const categoryId = transaction.categoryId.toString();
      const categoryName = transaction.category?.name || 'Unknown';
      
      if (!incomeByCategory.has(categoryId)) {
        incomeByCategory.set(categoryId, {
          categoryId,
          categoryName,
          amount: new Decimal(0),
          count: 0,
          percentage: 0
        });
      }
      
      const stats = incomeByCategory.get(categoryId);
      stats.amount = stats.amount.add(transaction.amount);
      stats.count += 1;
    }

    // 计算各类别的百分比
    for (const stats of expenseByCategory.values()) {
      if (totalExpense.greaterThan(0)) {
        stats.percentage = Number(stats.amount.div(totalExpense).mul(100));
      }
    }

    for (const stats of incomeByCategory.values()) {
      if (totalIncome.greaterThan(0)) {
        stats.percentage = Number(stats.amount.div(totalIncome).mul(100));
      }
    }

    // 转换为最终结果 - 使用嵌套对象格式，以类别名称为键
    const expenseResult = {};
    const incomeResult = {};
    
    // 处理支出类别
    Array.from(expenseByCategory.values())
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .forEach(stats => {
        expenseResult[stats.categoryName] = {
          category: stats.categoryId,
          totalIncome: 0,
          totalExpense: Number(stats.amount),
          count: stats.count
        };
      });
    
    // 处理收入类别
    Array.from(incomeByCategory.values())
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .forEach(stats => {
        incomeResult[stats.categoryName] = {
          category: stats.categoryId,
          totalIncome: Number(stats.amount),
          totalExpense: 0,
          count: stats.count
        };
      });
    
    return {
      '支出': expenseResult,
      '收入': incomeResult
    };
  }
}