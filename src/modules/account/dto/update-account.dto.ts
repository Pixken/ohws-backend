import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsOptional, IsString } from 'class-validator';

export class UpdateAccountRequestDto {
  @ApiProperty({ description: 'Account name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Account type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Account balance', required: false })
  @IsOptional()
  @IsDecimal()
  balance?: string;

  @ApiProperty({ description: 'Account icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Account color', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Is default account', required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Alert threshold', required: false })
  @IsOptional()
  @IsDecimal()
  alertThreshold?: string;
} 