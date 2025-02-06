import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashService } from './cash.service';
import { CreateCashDto } from './dto/create-cash.dto';
import { UpdateCashDto } from './dto/update-cash.dto';

@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post()
  create(@Body() createCashDto: CreateCashDto) {
    return this.cashService.create(createCashDto);
  }

  @Get()
  findAll() {
    return this.cashService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashDto: UpdateCashDto) {
    return this.cashService.update(+id, updateCashDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashService.remove(+id);
  }
}
