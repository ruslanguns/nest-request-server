import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [PrismaModule, StorageModule, ConfigModule],
})
export class CoreModule {}
