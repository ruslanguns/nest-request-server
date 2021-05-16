import { Module } from '@nestjs/common';
import { ConfigModule as CModule } from '@nestjs/config';
import filesystemConfig from 'src/config/filesystem.config';

@Module({
  imports: [
    CModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [filesystemConfig],
    }),
  ],
})
export class ConfigModule {}
