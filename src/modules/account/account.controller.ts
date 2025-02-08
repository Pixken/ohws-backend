import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  createAccount(@Body() data: any) {
    return this.accountService.createAccount(data);
  }

  @Post(':id')
  addAccount(@Param('id') id: string, @Body() data: any) {
    return this.accountService.addAccount(id, data);
  }

  @Get(':userId')
  findAccounts(@Param('userId') userId: string) {
    return this.accountService.findAccounts(userId);
  }
}
