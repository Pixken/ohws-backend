import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccountRequestDto {
  @ApiProperty({ description: 'Account name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Account type' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Initial balance', required: false })
  @IsOptional()
  @IsDecimal()
  initialBalance?: string;

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