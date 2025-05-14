import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  
  @IsString()
  @IsOptional()
  captchaUuid?: string;
  
  @IsString()
  @IsOptional()
  captchaCode?: string;
}