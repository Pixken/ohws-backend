import { Injectable } from '@nestjs/common';
import { CreateCashCategoryDto } from './dto/create-cash-category.dto';
import { UpdateCashCategoryDto } from './dto/update-cash-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CashCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCashCategoryDto: CreateCashCategoryDto) {
    // 转换类型字符串为枚举值
    const categoryType = createCashCategoryDto.type as CategoryType;
    
    return this.prisma.category.create({
      data: {
        name: createCashCategoryDto.name,
        type: categoryType,
        icon: createCashCategoryDto.icon,
        color: createCashCategoryDto.color,
        userId: createCashCategoryDto.userId,
        parentId: createCashCategoryDto.parentId ? createCashCategoryDto.parentId.toString() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * 创建默认消费类别
   * @param userId 用户ID
   * @returns 创建的消费类别
   */
  async createDefaults(userId: string) {
    return await this.prisma.category.createMany({
      data: [
        { name: '餐饮', userId, type: CategoryType.expense, icon: 'zondicons:location-food' },
        { name: '交通', userId, type: CategoryType.expense, icon: 'material-symbols:directions-car-rounded' },
        { name: '购物', userId, type: CategoryType.expense, icon: 'map:clothing-store' },
        { name: '娱乐', userId, type: CategoryType.expense, icon: 'solar:gamepad-bold' },
        { name: '其他', userId, type: CategoryType.expense, icon: 'basil:other-1-outline' },
        { name: '工资', userId, type: CategoryType.income, icon: 'mingcute:cash-fill' },
        { name: '奖金', userId, type: CategoryType.income, icon: 'material-symbols:money-bag' },
        { name: '投资', userId, type: CategoryType.income, icon: 'material-symbols:work' },
        { name: '其他', userId, type: CategoryType.income, icon: 'basil:other-1-outline' },
      ],
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.category.findMany({ where: { userId } });
  }

  findAll() {
    return this.prisma.category.findMany();
  }

  findOne(id: string) {
    // 将字符串ID转换为数字
    const categoryId = parseInt(id);
    return this.prisma.category.findUnique({ where: { id: categoryId.toString() } });
  }

  update(id: number, updateCashCategoryDto: UpdateCashCategoryDto) {
    // 转换类型字符串为枚举值(如果提供了类型)
    const updateData: any = { ...updateCashCategoryDto, updatedAt: new Date() };
    
    if (updateCashCategoryDto.type) {
      updateData.type = updateCashCategoryDto.type as CategoryType;
    }
    
    if (updateCashCategoryDto.parentId) {
      updateData.parentId = parseInt(updateCashCategoryDto.parentId);
    }
    
    return this.prisma.category.update({
      where: { id: id.toString() },
      data: updateData
    });
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id: id.toString() } });
  }
}
