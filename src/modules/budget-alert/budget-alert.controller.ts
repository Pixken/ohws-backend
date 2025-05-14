import { Controller, Get, Post, Body, Param, Delete, Headers, Put } from '@nestjs/common';
import { BudgetAlertService } from './budget-alert.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/custom.decorator';

@ApiTags('Finance Budget Alerts')
@Controller('finance/budget-alerts')
@Public()
export class BudgetAlertController {
  constructor(private readonly budgetAlertService: BudgetAlertService) {}

  /**
   * Create a budget alert
   */
  @ApiOperation({ summary: 'Create a budget alert' })
  @Post('create')
  async createBudgetAlert(
    @Headers('X-User-ID') userId: string,
    @Body() createBudgetAlertDto: any
  ) {
    try {
      const alert = await this.budgetAlertService.createBudgetAlert(userId, createBudgetAlertDto);
      return {
        code: 0,
        info: 'Success',
        data: alert
      };
    } catch (error) {
      return {
        code: 1,
        info: `Create budget alert failed: ${error.message}`
      };
    }
  }

  /**
   * Get all budget alerts for a user
   */
  @ApiOperation({ summary: 'Get all budget alerts for a user' })
  @Get()
  async getUserBudgetAlerts(@Headers('X-User-ID') userId: string) {
    try {
      const alerts = await this.budgetAlertService.getUserBudgetAlerts(userId);
      return alerts;
    } catch (error) {
      return {
        code: 1,
        info: `Get budget alerts failed: ${error.message}`
      };
    }
  }

  /**
   * Get alert by ID
   */
  @ApiOperation({ summary: 'Get alert by ID' })
  @Get(':alertId')
  async getBudgetAlertDetail(@Param('alertId') alertId: string) {
    try {
      const alert = await this.budgetAlertService.getBudgetAlertDetail(alertId);
      return alert;
    } catch (error) {
      return {
        code: 1,
        info: `Get budget alert detail failed: ${error.message}`
      };
    }
  }

  /**
   * Update alert status
   */
  @ApiOperation({ summary: 'Update alert status' })
  @Put(':alertId/status')
  async updateAlertStatus(
    @Headers('X-User-ID') userId: string,
    @Param('alertId') alertId: string,
    @Body() updateDto: any
  ) {
    try {
      const result = await this.budgetAlertService.updateAlertStatus(userId, alertId, updateDto.status);
      return {
        code: 0,
        info: 'Success',
        data: result
      };
    } catch (error) {
      return {
        code: 1,
        info: `Update alert status failed: ${error.message}`,
        data: false
      };
    }
  }

  /**
   * Delete alert
   */
  @ApiOperation({ summary: 'Delete alert' })
  @Delete(':alertId')
  async deleteBudgetAlert(
    @Headers('X-User-ID') userId: string,
    @Param('alertId') alertId: string
  ) {
    try {
      await this.budgetAlertService.deleteBudgetAlert(userId, alertId);
      return {
        code: 0,
        info: 'Success',
        data: true
      };
    } catch (error) {
      return {
        code: 1,
        info: `Delete budget alert failed: ${error.message}`,
        data: false
      };
    }
  }
} 