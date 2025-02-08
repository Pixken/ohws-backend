import { Injectable } from '@nestjs/common';
import { CreateCashCategoryDto } from './dto/create-cash-category.dto';
import { UpdateCashCategoryDto } from './dto/update-cash-category.dto';

@Injectable()
export class CashCategoryService {
  create(createCashCategoryDto: CreateCashCategoryDto) {
    return 'This action adds a new cashCategory';
  }

  findAll() {
    return `This action returns all cashCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashCategory`;
  }

  update(id: number, updateCashCategoryDto: UpdateCashCategoryDto) {
    return `This action updates a #${id} cashCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashCategory`;
  }
}
