import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CashDetailDto {
  @ApiProperty({ description: 'Transaction amount' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Transaction description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ description: 'Category ID' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}

export class CreateCashDto {
  @ApiProperty({ description: 'Cash details' })
  @IsNotEmpty()
  cash: CashDetailDto;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Account ID' })
  @IsNotEmpty()
  @IsString()
  accountId: string;
}
