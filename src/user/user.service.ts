import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: any) {
    return this.prisma.user.create({ data });
  }

  async findUsers() {
    return this.prisma.user.findMany();
  }
}
