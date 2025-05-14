import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({ description: 'Account ID' })
  id: number;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Account name' })
  name: string;

  @ApiProperty({ description: 'Account type' })
  type: string;

  @ApiProperty({ description: 'Account balance' })
  balance: string;

  @ApiProperty({ description: 'Account icon', required: false })
  icon?: string;

  @ApiProperty({ description: 'Account color', required: false })
  color?: string;

  @ApiProperty({ description: 'Is default account' })
  isDefault: boolean;

  @ApiProperty({ description: 'Alert threshold', required: false })
  alertThreshold?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
} 