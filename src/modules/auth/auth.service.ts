import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { CashCategoryService } from '../cash-category/cash-category.service';
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cashCategoryService: CashCategoryService,
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

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException(`用户不存在: ${email}`, HttpStatus.BAD_REQUEST);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    return {
      access_token: this.generateAccessToken(user.id),
      refresh_token: this.generateRefreshToken(user.id),
    };
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const payload = this.jwtService.verify(refreshToken, { secret: this.jwtSecret });
    if (!payload) {
      throw new HttpException('无效的刷新令牌', HttpStatus.BAD_REQUEST);
    }

    return {
      access_token: this.generateAccessToken(payload.userId),
      refresh_token: this.generateRefreshToken(payload.userId),
    };
  }

  async register(email: string, password: string): Promise<string> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpException('邮箱已存在', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    await this.cashCategoryService.createDefaults(user.id);

    return '注册成功';
  }
}
