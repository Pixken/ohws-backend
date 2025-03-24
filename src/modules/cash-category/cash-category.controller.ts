import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashCategoryService } from './cash-category.service';
import { CreateCashCategoryDto } from './dto/create-cash-category.dto';
import { UpdateCashCategoryDto } from './dto/update-cash-category.dto';

@Controller('cash-category')
export class CashCategoryController {
  constructor(private readonly cashCategoryService: CashCategoryService) {}

  @Post()
  create(@Body() createCashCategoryDto: CreateCashCategoryDto) {
    return this.cashCategoryService.create(createCashCategoryDto);
  }

  @Get()
  findAll() {
    return this.cashCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashCategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashCategoryDto: UpdateCashCategoryDto) {
    return this.cashCategoryService.update(+id, updateCashCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashCategoryService.remove(+id);
  }
}
