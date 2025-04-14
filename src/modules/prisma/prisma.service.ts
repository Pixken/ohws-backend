import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    
    // 确保返回扩展后的实例
    return this.$extends({
      query: {
        account: {
          async update({ args, query }) {
            console.log('开始更新账户');  // 添加更多日志点
            console.log('更新参数:', args);
            
            if ('balance' in args.data) {
              console.log('Balance field is being updated');
              console.log('New balance value:', args.data.balance);
            }
            
            const result = await query(args);
            console.log('更新结果:', result);  // 添加更多日志点
            
            if ('balance' in args.data) {
              console.log('Previous balance:', result.balance);
              console.log('Updated balance:', args.data.balance);
            }
            return result;
          }    
        }
      }
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
