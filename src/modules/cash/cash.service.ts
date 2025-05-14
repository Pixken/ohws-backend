import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionType } from '@prisma/client';

@Injectable()
export class CashService {
  constructor(
    private readonly prisma: PrismaService, 
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(createCashDto: CreateCashDto) {
    const price = createCashDto.cash.price;
    const type = createCashDto.cash.type;
    const accountId = parseInt(createCashDto.accountId);
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    console.log(account.balance);
    
    const newBalance = type === TransactionType.income 
      ? new Decimal(account.balance).add(new Decimal(price)) 
      : new Decimal(account.balance).sub(new Decimal(price));
    
    // 使用事务来确保更新操作被正确捕获
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance }
      });
      console.log('事务中更新结果:', updatedAccount);
      return updatedAccount;
    });
    
    const iconArr = await this.eventEmitter.emitAsync('getIcon', createCashDto.cash.description);
    
    // 使用 transaction 替代 cash
    return await this.prisma.transaction.create({ 
      data: { 
        id: uuidv4(),
        userId: createCashDto.userId,
        accountId: accountId,
        categoryId: createCashDto.cash.categoryId ? createCashDto.cash.categoryId : '0',
        amount: new Decimal(price),
        type: type,
        description: createCashDto.cash.description,
        transactionDate: new Date(),
        location: createCashDto.cash.location || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, 
      include: { 
        category: true, 
        account: true 
      } 
    });
  }

  async findAllByUser(userId: string) {
    return await this.prisma.transaction.findMany({ where: { userId } });
  }

  async findAllByAccount(accountId: string) {
    return await this.prisma.transaction.findMany({ 
      where: { accountId: parseInt(accountId) }
    });
  }

  async findAllByTime(userId: string, time: string[], accountId?: string, categoryId?: string, type?: string) {
    return await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: dayjs(time[0]).startOf('day').toDate(),
          lte: dayjs(time[1]).endOf('day').toDate(),
        },
        accountId: accountId ? parseInt(accountId) : undefined,
        categoryId: categoryId ? categoryId : undefined,
        type: type ? type as TransactionType : undefined,
      },
      include: {
        category: true,
        account: true,
      },
    });
  }

  async findAllByTimeRange(time: string[]) {
    return await this.prisma.transaction.findMany({
      where: {
        transactionDate: { 
          gte: dayjs(time[0]).startOf('day').toDate(), 
          lte: dayjs(time[1]).endOf('day').toDate() 
        },
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

  /**
   * Get all categories for a user
   */
  async getCategories(userId: string) {
    // Get system categories
    const systemCategories = await this.prisma.category.findMany({
      where: { userId: null }
    });

    // Get user-specific categories
    const userCategories = await this.prisma.category.findMany({
      where: { userId: userId }
    });

    // Combine and return both
    return [...systemCategories, ...userCategories];
  }

  /**
   * Get transactions by type with pagination
   */
  async getTransactionsByType(userId: string, type: string, pageNum: number, pageSize: number) {
    // Validate transaction type
    const validTypes = ['expense', 'income', 'transfer'];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new Error(`Invalid transaction type: ${type}`);
    }

    // Get total count for pagination
    const totalCount = await this.prisma.transaction.count({
      where: {
        userId: userId,
        type: type.toLowerCase() as any
      }
    });

    // Calculate pagination
    const skip = (pageNum - 1) * pageSize;

    // Fetch transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        type: type.toLowerCase() as any
      },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      skip: skip,
      take: pageSize,
      orderBy: {
        transactionDate: 'desc'
      }
    });

    // Convert to response format
    const items = transactions.map(transaction => this.convertToResponseDto(transaction));

    // Return paginated result
    return {
      pageNum,
      pageSize,
      total: totalCount,
      items: items
    };
  }

  /**
   * Create expense transaction
   */
  async createExpense(userId: string, data: any) {
    // Validate required fields
    if (!data.accountId) throw new Error('Account ID is required');
    if (!data.categoryId) throw new Error('Category ID is required');
    if (!data.amount) throw new Error('Amount is required');
    if (!data.transactionDate) throw new Error('Transaction date is required');

    const accountId = data.accountId;
    const categoryId = data.categoryId;
    const amount = new Decimal(data.amount);

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

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate transaction ID
    const transactionId = uuidv4();

    // Create transaction and update account balance within a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          id: transactionId,
          userId: userId,
          accountId: accountId,
          categoryId: categoryId,
          amount: amount,
          type: 'expense',
          description: data.description || null,
          transactionDate: new Date(data.transactionDate),
          location: data.location || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amount
          },
          updatedAt: new Date()
        }
      });

      // Add tags if provided
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        for (const tagId of data.tags) {
          await tx.transactionTag.create({
            data: {
              transactionId: transactionId,
              tagId: parseInt(tagId)
            }
          });
        }
      }

      return transaction;
    });
  }

  /**
   * Create income transaction
   */
  async createIncome(userId: string, data: any) {
    // Validate required fields
    if (!data.accountId) throw new Error('Account ID is required');
    if (!data.categoryId) throw new Error('Category ID is required');
    if (!data.amount) throw new Error('Amount is required');
    if (!data.transactionDate) throw new Error('Transaction date is required');

    const accountId = data.accountId;
    const categoryId = data.categoryId;
    const amount = new Decimal(data.amount);

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

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate transaction ID
    const transactionId = uuidv4();

    // Create transaction and update account balance within a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          id: transactionId,
          userId: userId,
          accountId: accountId,
          categoryId: categoryId,
          amount: amount,
          type: 'income',
          description: data.description || null,
          transactionDate: new Date(data.transactionDate),
          location: data.location || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: amount
          },
          updatedAt: new Date()
        }
      });

      // Add tags if provided
      if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        for (const tagId of data.tags) {
          await tx.transactionTag.create({
            data: {
              transactionId: transactionId,
              tagId: parseInt(tagId)
            }
          });
        }
      }

      return transaction;
    });
  }

  /**
   * Create transfer transaction
   */
  async createTransfer(userId: string, data: any) {
    // Validate required fields
    if (!data.fromAccountId) throw new Error('Source account ID is required');
    if (!data.toAccountId) throw new Error('Destination account ID is required');
    if (!data.categoryId) throw new Error('Category ID is required');
    if (!data.amount) throw new Error('Amount is required');
    if (!data.transactionDate) throw new Error('Transaction date is required');

    const fromAccountId = parseInt(data.fromAccountId);
    const toAccountId = parseInt(data.toAccountId);
    const categoryId = parseInt(data.categoryId);
    const amount = new Decimal(data.amount);

    // Verify accounts belong to user
    const fromAccount = await this.prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: userId
      }
    });

    const toAccount = await this.prisma.account.findFirst({
      where: {
        id: toAccountId,
        userId: userId
      }
    });

    if (!fromAccount) {
      throw new Error('Source account not found or does not belong to user');
    }

    if (!toAccount) {
      throw new Error('Destination account not found or does not belong to user');
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId.toString() }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Generate transaction ID
    const transactionId = uuidv4();

    // Create transaction and update account balances within a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          id: transactionId,
          userId: userId,
          accountId: fromAccountId,
          categoryId: categoryId.toString(),
          amount: amount,
          type: 'transfer',
          description: data.description || null,
          transactionDate: new Date(data.transactionDate),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Update source account balance
      await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: {
            decrement: amount
          },
          updatedAt: new Date()
        }
      });

      // Update destination account balance
      await tx.account.update({
        where: { id: toAccountId },
        data: {
          balance: {
            increment: amount
          },
          updatedAt: new Date()
        }
      });

      return transaction;
    });
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string, transactionId: string) {
    // Find the transaction
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: userId
      }
    });

    if (!transaction) {
      throw new Error('Transaction not found or does not belong to user');
    }

    // Perform deletion in a transaction to also update the account balance
    await this.prisma.$transaction(async (tx) => {
      // Revert the account balance
      if (transaction.type === 'expense') {
        // For expense, add the amount back
        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              increment: transaction.amount
            },
            updatedAt: new Date()
          }
        });
      } else if (transaction.type === 'income') {
        // For income, subtract the amount
        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: {
              decrement: transaction.amount
            },
            updatedAt: new Date()
          }
        });
      } else if (transaction.type === 'transfer') {
        // For transfer, need the destination account ID
        // This is a simplification, in a real app would need to store both accounts in the transaction
        throw new Error('Deleting transfer transactions is not supported');
      }

      // Delete transaction tags
      await tx.transactionTag.deleteMany({
        where: { transactionId: transactionId }
      });

      // Delete the transaction
      await tx.transaction.delete({
        where: { id: transactionId }
      });
    });
  }

  /**
   * Get transaction details
   */
  async getTransactionDetail(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!transaction) {
      return []
    }

    return this.convertToResponseDto(transaction);
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId: userId },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    return transactions.map(transaction => this.convertToResponseDto(transaction));
  }

  /**
   * Get account transactions
   */
  async getAccountTransactions(accountId: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: { accountId: accountId },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    return transactions.map(transaction => this.convertToResponseDto(transaction));
  }

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date) {
    console.log(startDate, endDate)
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId: userId,
        transactionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    return transactions.map(transaction => this.convertToResponseDto(transaction));
  }

  /**
   * Export transactions to Excel
   */
  async exportTransactionsToExcel(userId: string, startDate: Date | null, endDate: Date | null) {
    // Define where clause for the query
    const whereClause: any = { userId: userId };
    
    // Add date range if provided
    if (startDate && endDate) {
      whereClause.transactionDate = {
        gte: startDate,
        lte: endDate
      };
    }

    // Get transactions
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    // Convert transactions to export format
    const exportData = transactions.map(transaction => {
      return {
        id: transaction.id,
        date: transaction.transactionDate.toISOString().split('T')[0],
        time: transaction.transactionTime ? 
              transaction.transactionTime.toTimeString().split(' ')[0] : '',
        type: this.getTransactionTypeText(transaction.type),
        amount: Number(transaction.amount),
        category: transaction.category.name,
        account: transaction.account.name,
        description: transaction.description || '',
        location: transaction.location || '',
        tags: transaction.tags.map(tt => tt.tag.name).join(', ')
      };
    });

    return exportData;
  }

  /**
   * Get friendly transaction type text
   */
  private getTransactionTypeText(type: any): string {
    switch (type) {
      case 'expense':
        return 'Expense';
      case 'income':
        return 'Income';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Unknown';
    }
  }

  /**
   * Convert transaction entity to response DTO
   */
  private convertToResponseDto(transaction: any): any {
    return {
      id: transaction.id,
      userId: transaction.userId,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: Number(transaction.amount),
      type: transaction.type,
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      transactionTime: transaction.transactionTime,
      location: transaction.location,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      account: transaction.account ? {
        id: transaction.account.id,
        name: transaction.account.name,
        type: transaction.account.type,
        balance: Number(transaction.account.balance)
      } : null,
      category: transaction.category ? {
        id: transaction.category.id,
        name: transaction.category.name,
        type: transaction.category.type,
        icon: transaction.category.icon,
        color: transaction.category.color
      } : null,
      tags: transaction.tags ? transaction.tags.map(tt => ({
        id: tt.tag.id,
        name: tt.tag.name,
        color: tt.tag.color
      })) : []
    };
  }
}
