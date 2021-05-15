import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './core/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly data: PrismaService) {}

  /**
   * This method returns a User randomly
   */
  async getRandomUser() {
    const count = await this.data.user.count();
    const randomNumber = Math.floor(Math.random() * count) + 1;

    if (!count) {
      throw new NotFoundException('Still no available data, please seeed it');
    }

    return await this.data.user.findFirst({ take: 1, skip: randomNumber });
  }
}
