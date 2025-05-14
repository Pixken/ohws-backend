import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address for password reset' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
} 