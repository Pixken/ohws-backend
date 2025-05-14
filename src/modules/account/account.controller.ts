import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Req } from '@nestjs/common';
import { AccountService } from './account.service';
import { Public } from 'src/common/decorator/custom.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Finance Accounts')
@Controller('finance/accounts')
@Public()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Create a new account
   */
  @ApiOperation({ summary: 'Create a new account' })
  @Post('create')
  async createAccount(
    @Headers('X-User-ID') headerUserId: string,
    @Body() request: any
  ) {
    try {
      // Use userId from header if available, otherwise from request body
      const userId = headerUserId || request.userId;
      
      if (!userId) {
        return {
          code: 1,
          info: 'User ID is required. Please provide it in X-User-ID header or in the request body'
        };
      }
      
      console.log('Creating account with userId:', userId);
      const result = await this.accountService.createAccount(userId, request);
      return {
        code: 0,
        info: 'Success',
        data: result
      };
    } catch (error) {
      console.error('Error creating account:', error.message, 'UserId:', headerUserId || request.userId);
      return {
        code: 1,
        info: `Create account failed: ${error.message}`,
        debug: { userId: headerUserId || request.userId }
      };
    }
  }

  /**
   * Update an account
   */
  @ApiOperation({ summary: 'Update an account' })
  @Put(':accountId')
  async updateAccount(
    @Headers('X-User-ID') userId: string,
    @Param('accountId') accountId: string,
    @Body() request: any
  ) {
    try {
      const result = await this.accountService.updateAccount(parseInt(accountId), request);
      return {
        code: 0,
        info: 'Success',
        data: true
      };
    } catch (error) {
      return {
        code: 1,
        info: `Update account failed: ${error.message}`,
        data: false
      };
  }
  }

  /**
   * Delete an account
   */
  @ApiOperation({ summary: 'Delete an account' })
  @Delete(':accountId')
  async deleteAccount(
    @Headers('X-User-ID') userId: string,
    @Param('accountId') accountId: string
  ) {
    try {
      await this.accountService.deleteAccount(parseInt(accountId));
      return {
        code: 0,
        info: 'Success',
        data: true
      };
    } catch (error) {
      return {
        code: 1,
        info: `Delete account failed: ${error.message}`,
        data: false
      };
    }
  }

  /**
   * Get all user accounts
   */
  @ApiOperation({ summary: 'Get all user accounts' })
  @Get()
  async getUserAccounts(@Headers('X-User-ID') userId: string) {
    try {
      const accounts = await this.accountService.getUserAccounts(userId);
      return accounts;
    } catch (error) {
      return {
        code: 1,
        info: `Get user accounts failed: ${error.message}`
      };
    }
  }

  /**
   * Get account details
   */
  @ApiOperation({ summary: 'Get account details' })
  @Get(':accountId')
  async getAccountDetail(
    @Headers('X-User-ID') userId: string,
    @Param('accountId') accountId: string
  ) {
    try {
      const account = await this.accountService.getAccountDetail(parseInt(accountId));
      return account;
    } catch (error) {
      return {
        code: 1,
        info: `Get account detail failed: ${error.message}`
      };
    }
  }
}
