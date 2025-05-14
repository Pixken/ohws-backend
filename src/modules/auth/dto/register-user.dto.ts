import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nickname (optional)', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;
} 