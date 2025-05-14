import { Body, Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { Public } from 'src/common/decorator/custom.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('identity')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(
      loginDto.username, 
      loginDto.password,
      loginDto.captchaUuid,
      loginDto.captchaCode
    );
  }

  @Post('refresh')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  getProfile(@Request() req) {
    return req.user;
  }
}
