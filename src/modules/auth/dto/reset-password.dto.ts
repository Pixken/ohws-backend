import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmPassword: string;
} 