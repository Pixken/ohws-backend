import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { CashService } from './cash.service';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';
import { Public } from 'src/common/decorator/custom.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Finance Transactions')
@Controller('finance/transactions')
@Public()
export class CashController {
  constructor(private readonly cashService: CashService) {}

  /**
   * 获取并规范化用户ID
   */
  private getUserId(headerUserId: string, body: any = {}): string {
    return headerUserId || body.userId;
  }

  /**
   * Get categories
   */
  @ApiOperation({ summary: 'Get all categories' })
  @Get('getCategories')
  async getCategories(@Headers('X-User-ID') headerUserId: string, @Body() body: any) {
    try {
      const userId = this.getUserId(headerUserId, body);
      if (!userId) {
        return {
          code: 1,
          info: 'User ID is required. Please provide it in X-User-ID header or in the request body'
        };
      }
      
      const categories = await this.cashService.getCategories(userId);
      return categories;
    } catch (error) {
      return {
        code: 1,
        info: `Get categories failed: ${error.message}`
      };
    }
  }

  /**
   * Get transactions by type with pagination
   */
  @ApiOperation({ summary: 'Get transactions by type' })
  @Get('getTransactionsByType/:type')
  async getTransactionsByType(
    @Headers('X-User-ID') userId: string,
    @Param('type') type: string,
    @Query('pageNum') pageNum: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    try {
      const transactions = await this.cashService.getTransactionsByType(
        userId, 
        type, 
        parseInt(pageNum), 
        parseInt(pageSize)
      );
      
      return transactions;
    } catch (error) {
      return {
        code: 1,
        info: `Get transactions by type failed: ${error.message}`
      };
    }
  }

  /**
   * Create expense transaction
   */
  @ApiOperation({ summary: 'Create expense transaction' })
  @Post('expense')
  async createExpense(
    @Headers('X-User-ID') userId: string,
    @Body() createExpenseDto: any
  ) {
    console.log(111232)
    try {
      const transaction = await this.cashService.createExpense(userId, createExpenseDto);
      return {
        code: 0,
        info: 'Success',
        data: transaction.id
      };
    } catch (error) {
      return {
        code: 1,
        info: `Create expense failed: ${error.message}`
      };
    }
  }

  /**
   * Create income transaction
   */
  @ApiOperation({ summary: 'Create income transaction' })
  @Post('income')
  async createIncome(
    @Headers('X-User-ID') userId: string,
    @Body() createIncomeDto: any
  ) {
    try {
      const transaction = await this.cashService.createIncome(userId, createIncomeDto);
      return {
        code: 0,
        info: 'Success',
        data: transaction.id
      };
    } catch (error) {
      return {
        code: 1,
        info: `Create income failed: ${error.message}`
      };
    }
  }

  /**
   * Create transfer transaction
   */
  @ApiOperation({ summary: 'Create transfer transaction' })
  @Post('transfer')
  async createTransfer(
    @Headers('X-User-ID') userId: string,
    @Body() createTransferDto: any
  ) {
    try {
      const transaction = await this.cashService.createTransfer(userId, createTransferDto);
      return {
        code: 0,
        info: 'Success',
        data: transaction.id
      };
    } catch (error) {
      return {
        code: 1,
        info: `Create transfer failed: ${error.message}`
      };
    }
  }

  /**
   * Delete transaction
   */
  @ApiOperation({ summary: 'Delete transaction' })
  @Delete(':transactionId')
  async deleteTransaction(
    @Headers('X-User-ID') userId: string,
    @Param('transactionId') transactionId: string
  ) {
    try {
      await this.cashService.deleteTransaction(userId, transactionId);
      return {
        code: 0,
        info: 'Success',
        data: true
      };
    } catch (error) {
      return {
        code: 1,
        info: `Delete transaction failed: ${error.message}`,
        data: false
      };
    }
  }


  /**
   * Get user transactions
   */
  @ApiOperation({ summary: 'Get user transactions' })
  @Get('user')
  async getUserTransactions(@Headers('X-User-ID') userId: string) {
    try {
      const transactions = await this.cashService.getUserTransactions(userId);
      return transactions;
    } catch (error) {
      return {
        code: 1,
        info: `Get user transactions failed: ${error.message}`
      };
    }
  }

  /**
   * Get account transactions
   */
  @ApiOperation({ summary: 'Get account transactions' })
  @Get('account/:accountId')
  async getAccountTransactions(@Param('accountId') accountId: string) {
    try {
      const transactions = await this.cashService.getAccountTransactions(parseInt(accountId));
      return transactions;
    } catch (error) {
      return {
        code: 1,
        info: `Get account transactions failed: ${error.message}`
      };
    }
  }

  /**
   * Get transactions by date range
   */
  @ApiOperation({ summary: 'Get transactions by date range' })
  @Get('date-range')
  async getTransactionsByDateRange(
    @Headers('X-User-ID') headerUserId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') queryUserId: string,
    @Body() body: any
  ) {
    console.log(111)
    try {
      const userId = headerUserId || queryUserId || body.userId;
      if (!userId) {
        return {
          code: 1,
          info: 'User ID is required. Please provide it in X-User-ID header, userId query parameter, or in the request body'
        };
      }
      
      console.log(1)
      
      const transactions = await this.cashService.getTransactionsByDateRange(
        userId, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      return transactions;
    } catch (error) {
      return {
        code: 1,
        info: `Get transactions by date range failed: ${error.message}`
      };
    }
  }

  /**
   * Export transactions to Excel
   */
  @ApiOperation({ summary: 'Export transactions to Excel' })
  @Get('export/excel')
  async exportTransactionsToExcel(
    @Headers('X-User-ID') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const exportData = await this.cashService.exportTransactionsToExcel(
        userId,
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
      
      return exportData;
    } catch (error) {
      return {
        code: 1,
        info: `Export transactions failed: ${error.message}`
      };
    }
  }

  
  /**
   * Get transaction details
   */
  @ApiOperation({ summary: 'Get transaction details' })
  @Get(':transactionId')
  async getTransactionDetail(@Param('transactionId') transactionId: string) {
    try {
      const transaction = await this.cashService.getTransactionDetail(transactionId);
      return transaction;
    } catch (error) {
      return {
        code: 1,
        info: `Get transaction detail failed: ${error.message}`
      };
    }
  }
}
