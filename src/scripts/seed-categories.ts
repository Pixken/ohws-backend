import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加默认分类数据...');

  const defaultCategories = [
    {
      name: "餐饮",
      type: CategoryType.expense,
      icon: "unjs:jiti",
      color: "#FF5722",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-07T10:05:10")
    },
    {
      name: "购物",
      type: CategoryType.expense,
      icon: "unjs:confbox",
      color: "#9C27B0",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:47")
    },
    {
      name: "住房",
      type: CategoryType.expense,
      icon: "unjs:citty",
      color: "#4CAF50",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:01")
    },
    {
      name: "娱乐",
      type: CategoryType.expense,
      icon: "garden:basketball-fill-16",
      color: "#FFC107",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:37")
    },
    {
      name: "医疗",
      type: CategoryType.expense,
      icon: "twemoji:baby-angel",
      color: "#F44336",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:40")
    },
    {
      name: "教育",
      type: CategoryType.expense,
      icon: "twemoji:books",
      color: "#3F51B5",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:33")
    },
    {
      name: "工资",
      type: CategoryType.income,
      icon: "memory:alpha-s",
      color: "#4CAF50",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:39")
    },
    {
      name: "奖金",
      type: CategoryType.income,
      icon: "twemoji:1st-place-medal",
      color: "#8BC34A",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:14")
    },
    {
      name: "投资收益",
      type: CategoryType.income,
      icon: "iconoir:activity",
      color: "#CDDC39",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:28")
    },
    {
      name: "转账",
      type: CategoryType.transfer,
      icon: "iconoir:arrow-separate",
      color: "#607D8B",
      createdAt: new Date("2025-03-30T10:03:57"),
      updatedAt: new Date("2025-05-08T08:05:53")
    },
    {
      name: "交通",
      type: CategoryType.expense,
      icon: "nimbus:scooter",
      color: "#2196F3",
      createdAt: new Date("2025-04-28T10:04:43"),
      updatedAt: new Date("2025-05-08T08:05:19")
    },
    {
      name: "居家",
      type: CategoryType.expense,
      icon: "dashicons:admin-home",
      color: "#795548",
      createdAt: new Date("2025-04-28T10:04:43"),
      updatedAt: new Date("2025-05-08T08:05:29")
    },
    {
      name: "兼职",
      type: CategoryType.income,
      icon: "emojione-v1:alarm-clock",
      color: "#8BC34A",
      createdAt: new Date("2025-04-28T10:04:43"),
      updatedAt: new Date("2025-05-08T08:05:31")
    },
    {
      name: "账户互转",
      type: CategoryType.transfer,
      icon: "humbleicons:arrows-up-down",
      color: "#3F51B5",
      createdAt: new Date("2025-04-28T10:04:43"),
      updatedAt: new Date("2025-05-08T08:05:11")
    }
  ];

  // 首先，确认没有现有分类数据（以防重复插入）
  const existingCount = await prisma.category.count();
  if (existingCount > 0) {
    console.log(`数据库中已存在 ${existingCount} 个分类，将先删除所有分类`);
    await prisma.category.deleteMany();
  }

  // 逐个插入分类数据
  for (const category of defaultCategories) {
    try {
      const created = await prisma.category.create({
        data: category
      });
      console.log(`成功添加分类: ${category.name} (ID: ${created.id})`);
    } catch (error) {
      console.error(`添加分类 ${category.name} 失败:`, error);
    }
  }

  console.log('分类数据添加完成');
}

main()
  .catch((e) => {
    console.error('脚本执行出错:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 