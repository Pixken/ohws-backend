import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // Verify the JWT payload contains a user ID
    if (!payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.prisma.sysUser.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user account is enabled
    if (user.enabled === false) {
      throw new UnauthorizedException('Account is disabled');
    }

    return { userId: payload.userId, username: payload.username };
  }
}