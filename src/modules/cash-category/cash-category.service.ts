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

  /**
   * 创建默认消费类别
   * @param userId 用户ID
   * @returns 创建的消费类别
   */
  createDefaults(userId: string) {
    return this.prisma.cashCategory.createMany({
      data: [
        { name: '餐饮', userId, type: 'expense' },
        { name: '交通', userId, type: 'expense' },
        { name: '购物', userId, type: 'expense' },
        { name: '娱乐', userId, type: 'expense' },
        { name: '其他', userId, type: 'expense' },
        { name: '工资', userId, type: 'income' },
        { name: '奖金', userId, type: 'income' },
        { name: '投资', userId, type: 'income' },
        { name: '其他', userId, type: 'income' },
      ],
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.cashCategory.findMany({ where: { userId } });
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
