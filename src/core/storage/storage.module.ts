import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageModule as SModule } from '@squareboat/nest-storage';
import { FILESYSTEM } from '../../config/constants';

@Module({
  imports: [
    SModule.registerAsync({
      useFactory: (config: ConfigService) => config.get(FILESYSTEM),
      inject: [ConfigService],
    }),
  ],
})
export class StorageModule {}
