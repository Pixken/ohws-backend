import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { CashCategoryService } from '../cash-category/cash-category.service';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  id: string;
  username: string;
  nickname: string;
  email: string;
  profile: {
    username: string;
    nickname: string;
    email: string;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cashCategoryService: CashCategoryService,
    private userService: UserService,
  ) {}

  private jwtSecret = this.configService.get<string>('JWT_SECRET');

  private generateAccessToken(userId: string) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '1h',
    });
  }

  private generateRefreshToken(userId: string) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '7d',
    });
  }

  async login(username: string, password: string, captchaUuid?: string, captchaCode?: string): Promise<LoginResponse> {
    // Validate captcha if provided
    if (captchaUuid && captchaCode) {
      const isValidCaptcha = this.userService.validateCaptcha(captchaUuid, captchaCode);
      if (!isValidCaptcha) {
        throw new HttpException('验证码错误或已过期', HttpStatus.BAD_REQUEST);
      }
    }
    
    const user = await this.prisma.sysUser.findUnique({ where: { username } });
    if (!user) {
      throw new HttpException(`用户不存在: ${username}`, HttpStatus.BAD_REQUEST);
    }

    // Add salt to password before comparing, just like during registration
    const isPasswordValid = await bcrypt.compare(password + user.salt, user.password);
    if (!isPasswordValid) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    return {
      access_token: this.generateAccessToken(user.id),
      refresh_token: this.generateRefreshToken(user.id),
      ...user,
      profile: {
        username: user.username,
        nickname: user.nickname,
        email: user.email,
      }
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const payload = this.jwtService.verify(refreshToken, { secret: this.jwtSecret });
    if (!payload) {
      throw new HttpException('无效的刷新令牌', HttpStatus.BAD_REQUEST);
    }

    // Get user data to include in response
    const user = await this.prisma.sysUser.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    return {
      access_token: this.generateAccessToken(payload.userId),
      refresh_token: this.generateRefreshToken(payload.userId),
      ...user,
      profile: {
        username: user.username,
        nickname: user.nickname,
        email: user.email,
      }
    };
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterUserDto) {
    // Check if username already exists
    const existingUser = await this.prisma.sysUser.findUnique({ where: { username: registerDto.username } });
    if (existingUser) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);
    }

    // Check if email already exists
    const existingEmail = await this.prisma.sysUser.findUnique({ where: { email: registerDto.email } });
    if (existingEmail) {
      throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
    }
    
    // Generate salt and hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password + salt, 10);
    
    // Create new user
    const user = await this.prisma.sysUser.create({
      data: {
        id: uuidv4(),
        username: registerDto.username,
        password: hashedPassword,
        salt: salt,
        email: registerDto.email,
        nickname: registerDto.nickname || registerDto.username,
        enabled: true,
        createTime: new Date(),
        updateTime: new Date()
      }
    });
    
    // Create default categories for new user
    await this.cashCategoryService.createDefaults(user.id);

    // Return user without sensitive information
    const { password, salt: userSalt, ...result } = user;
    return result;
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // Implementation for password reset request
    // This would typically involve:
    // 1. Finding the user by email
    // 2. Generating a reset token
    // 3. Sending an email with reset instructions
    
    return { message: 'If your email exists in our system, a password reset link has been sent' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Implementation for password reset
    // This would typically involve:
    // 1. Validating the reset token
    // 2. Updating the user's password
    
    return { message: 'Password has been reset successfully' };
  }
}
