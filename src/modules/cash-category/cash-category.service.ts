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
        { name: '餐饮', userId, type: 'expense', icon: 'zondicons:location-food' },
        { name: '交通', userId, type: 'expense', icon: 'material-symbols:directions-car-rounded' },
        { name: '购物', userId, type: 'expense', icon: 'map:clothing-store' },
        { name: '娱乐', userId, type: 'expense', icon: 'solar:gamepad-bold' },
        { name: '其他', userId, type: 'expense', icon: 'basil:other-1-outline' },
        { name: '工资', userId, type: 'income', icon: 'mingcute:cash-fill' },
        { name: '奖金', userId, type: 'income', icon: 'material-symbols:money-bag' },
        { name: '投资', userId, type: 'income', icon: 'material-symbols:work' },
        { name: '其他', userId, type: 'income', icon: 'basil:other-1-outline' },
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
