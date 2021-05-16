import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Storage } from '@squareboat/nest-storage';
import { Response } from 'express';
import { createWriteStream, existsSync, mkdirSync, rmdirSync } from 'fs';
import got from 'got';
import { extname, join } from 'path';
import { PrismaService } from './core/prisma/prisma.service';

@Injectable()
export class AppService {
  logger = new Logger();

  constructor(private readonly data: PrismaService) {}

  async getRandomUser() {
    const count = await this.data.user.count();
    const randomNumber = Math.floor(Math.random() * count) + 1;
    if (!count) {
      throw new NotFoundException('Still no available data, please seeed it');
    }
    return await this.data.user.findFirst({ take: 1, skip: randomNumber });
  }

  async uploadFile(file: Express.Multer.File) {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return Storage.disk('docs').put(
      `${randomName}${extname(file.originalname)}`,
      file.buffer,
    );
  }

  async downloadFile(fileName: string, res: Response) {
    const url = await Storage.disk('docs').signedUrl(fileName, 1000);
    if (!url) {
      throw new NotFoundException('No hay un archivo con ese nombre.');
    }
    const tmpDir = join(process.cwd(), 'tmp');
    if (!existsSync(tmpDir)) {
      mkdirSync(tmpDir);
    }
    const fileLocation = `${tmpDir}/${fileName}`;
    const stream = createWriteStream(fileLocation);
    return got
      .stream(url)
      .pipe(stream)
      .on('error', (error) => {
        throw new BadGatewayException(error);
      })
      .on('close', () => {
        this.logger.log('File written!');
        return res.sendFile(fileLocation);
      });
  }

  @Cron(CronExpression.EVERY_HOUR)
  deleteTemporaryFiles() {
    const directory = join(process.cwd(), 'tmp');
    if (existsSync(directory)) {
      this.logger.verbose('Removing temporary files!');
      rmdirSync(directory, { recursive: true });
    }
  }
}
