import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
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

  @Get(':id')
  findAccounts(@Param('id') id: string) {
    return this.accountService.findAccounts(id);
  }
}
