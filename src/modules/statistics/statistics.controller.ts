import { Controller, Get, Headers, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/custom.decorator';

@ApiTags('Finance Statistics')
@Controller('finance/statistics')
@Public()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * 获取月度统计数据
   */
  @ApiOperation({ summary: '获取用户时间范围内的月度收支统计' })
  @Get('monthly')
  async getMonthlyStatistics(
    @Headers('X-User-ID') headerUserId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') queryUserId: string,
  ) {
    try {
      const userId = headerUserId || queryUserId;
      if (!userId) {
        return {
          code: 1,
          info: 'User ID is required. Please provide it in X-User-ID header or userId query parameter'
        };
      }
      
      // 默认查询最近12个月
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate 
        ? new Date(startDate) 
        : new Date(end.getFullYear(), end.getMonth() - 11, 1);

      const statistics = await this.statisticsService.getMonthlyStatistics(
        userId, 
        start, 
        end
      );
      
      // 直接返回数据，不包装
      return statistics;
    } catch (error) {
      return {
        code: 1,
        info: `Get monthly statistics failed: ${error.message}`
      };
    }
  }

  /**
   * 按类别统计交易
   */
  @ApiOperation({ summary: '获取指定日期范围内按类别分组的交易统计' })
  @Get('transactionsByCategory')
  async getTransactionsByCategory(
    @Headers('X-User-ID') headerUserId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') queryUserId: string,
  ) {
    try {
      const userId = headerUserId || queryUserId;
      if (!userId) {
        return {
          code: 1,
          info: 'User ID is required. Please provide it in X-User-ID header or userId query parameter'
        };
      }
      
      // 默认查询最近一个月
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate 
        ? new Date(startDate) 
        : new Date(end.getFullYear(), end.getMonth() - 1, end.getDate());

      const statistics = await this.statisticsService.getTransactionsByCategory(
        userId, 
        start, 
        end
      );
      
      // 直接返回数据，不包装
      return statistics;
    } catch (error) {
      return {
        code: 1,
        info: `Get transactions by category failed: ${error.message}`
      };
    }
  }
} 