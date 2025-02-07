import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: any) {
    return this.prisma.user.create({ data });
  }

  async findUsers() {
    return this.prisma.user.findMany();
  }

  async findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
