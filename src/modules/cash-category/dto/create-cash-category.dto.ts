import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCashCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category type (expense, income, transfer)' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Category icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Category color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'User ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;
}
