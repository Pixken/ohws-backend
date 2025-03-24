import { Injectable } from '@nestjs/common';
import { CreateCashCategoryDto } from './dto/create-cash-category.dto';
import { UpdateCashCategoryDto } from './dto/update-cash-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCashCategoryDto: CreateCashCategoryDto) {
    return 'This action adds a new cashCategory';
  }

  findAll() {
    return this.prisma.cashCategory.findMany();
  }

  findOne(id: string) {
    return this.prisma.cashCategory.findUnique({ where: { id } });
  }

  update(id: number, updateCashCategoryDto: UpdateCashCategoryDto) {
    return `This action updates a #${id} cashCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashCategory`;
  }
}
