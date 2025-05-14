import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { CashCategoryService } from './cash-category.service';
import { CreateCashCategoryDto } from './dto/create-cash-category.dto';
import { UpdateCashCategoryDto } from './dto/update-cash-category.dto';
import { Public } from 'src/common/decorator/custom.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Finance Categories')
@Controller('finance/categories')
@Public()
export class CashCategoryController {
  constructor(private readonly cashCategoryService: CashCategoryService) {}

  /**
   * Create a new category
   */
  @ApiOperation({ summary: 'Create a new category' })
  @Post('create')
  async createCategory(
    @Headers('X-User-ID') userId: string,
    @Body() createCategoryDto: CreateCashCategoryDto
  ) {
    try {
      const category = await this.cashCategoryService.create({
        ...createCategoryDto,
        userId
      });
      
      return {
        code: 0,
        info: 'Success',
        data: category
      };
    } catch (error) {
      return {
        code: 1,
        info: `Create category failed: ${error.message}`
      };
    }
  }

  /**
   * Get all categories for a user
   */
  @ApiOperation({ summary: 'Get all categories for a user' })
  @Get()
  async getUserCategories(@Headers('X-User-ID') userId: string) {
    try {
      const categories = await this.cashCategoryService.findAllByUser(userId);
      return categories;
    } catch (error) {
      return {
        code: 1,
        info: `Get categories failed: ${error.message}`
      };
    }
  }

  /**
   * Get category details
   */
  @ApiOperation({ summary: 'Get category details' })
  @Get(':categoryId')
  async getCategoryDetail(@Param('categoryId') categoryId: string) {
    try {
      const category = await this.cashCategoryService.findOne(categoryId);
      return category;
    } catch (error) {
      return {
        code: 1,
        info: `Get category detail failed: ${error.message}`
      };
    }
  }

  /**
   * Update a category
   */
  @ApiOperation({ summary: 'Update a category' })
  @Patch(':categoryId')
  async updateCategory(
    @Headers('X-User-ID') userId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCashCategoryDto
  ) {
    try {
      const category = await this.cashCategoryService.update(
        +categoryId, 
        updateCategoryDto
      );
      
      return {
        code: 0,
        info: 'Success',
        data: category
      };
    } catch (error) {
      return {
        code: 1,
        info: `Update category failed: ${error.message}`,
        data: false
      };
    }
  }

  /**
   * Delete a category
   */
  @ApiOperation({ summary: 'Delete a category' })
  @Delete(':categoryId')
  async deleteCategory(
    @Headers('X-User-ID') userId: string,
    @Param('categoryId') categoryId: string
  ) {
    try {
      await this.cashCategoryService.remove(+categoryId);
      return {
        code: 0,
        info: 'Success',
        data: true
      };
    } catch (error) {
      return {
        code: 1,
        info: `Delete category failed: ${error.message}`,
        data: false
      };
    }
  }
}
