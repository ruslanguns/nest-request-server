import {
  RequestedJobCard,
  User,
  UserProfile,
  UserProfilePhoto,
} from '.prisma/client';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Storage } from '@squareboat/nest-storage';
import { Response } from 'express';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  rmdirSync,
  WriteStream,
} from 'fs';
import got from 'got';
import { extname, join } from 'path';
import { PrismaService } from './core/prisma/prisma.service';
import { CreateUserAddressDTO } from './dto/create-user-address.dto';
import { RequestJobCardDTO } from './dto/request-new-card.dto';
import { AwsFileResponse } from './interfaces/aws-file-response.interface';

@Injectable()
export class AppService {
  logger = new Logger();

  constructor(private readonly data: PrismaService) {}

  async getRandomUser(): Promise<User> {
    const count = await this.data.user.count();
    const randomNumber = Math.floor(Math.random() * count) + 1;
    if (!count) {
      throw new NotFoundException('Still no available data, please seeed it');
    }
    return await this.data.user.findFirst({
      take: 1,
      skip: randomNumber,
      include: { jobCards: true, profile: true, photo: true },
    });
  }

  async addUserAddress({
    userId,
    ...dto
  }: CreateUserAddressDTO): Promise<UserProfile> {
    const user = await this.data.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User does not exist with the provided ID');
    }

    if (!user.profile) {
      return await this.data.userProfile.create({
        data: { userId, ...dto },
      });
    }

    return await this.data.userProfile.update({
      where: { id: user.profile.id },
      data: { ...dto },
    });
  }

  async updateUserProfilePhoto(
    userId: string,
    photo: Express.Multer.File,
  ): Promise<UserProfilePhoto> {
    const user = await this.data.user.findUnique({
      where: { id: userId },
      include: { photo: true },
    });
    if (!user) {
      throw new NotFoundException('User does not exist with the provided ID');
    }
    const { key } = await this.uploadFile(photo);
    if (!user.photo) {
      return await this.data.userProfilePhoto.create({
        data: { userId, url: key },
      });
    }
    await Storage.disk('docs').delete(key);
    return await this.data.userProfilePhoto.update({
      where: { id: user.photo.id },
      data: { url: key },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<AwsFileResponse> {
    try {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return Storage.disk('docs').put(
        `${randomName}${extname(file.originalname)}`,
        file.buffer,
      );
    } catch (err) {
      throw new BadGatewayException(
        'There are errors with the file server',
        err,
      );
    }
  }

  async downloadFile(fileName: string, res: Response): Promise<WriteStream> {
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

  async requestJobCard(dto: RequestJobCardDTO): Promise<RequestedJobCard> {
    const jobCard = await this.data.userJobCard.findUnique({
      where: { id: dto.jobCardId },
      include: { user: { include: { photo: true, profile: true } } },
    });

    if (!jobCard.user.photo) {
      throw new BadRequestException('User profile photo is required.');
    }

    if (!jobCard.user.profile) {
      throw new BadRequestException('User Profile address is required.');
    }

    return await this.data.requestedJobCard.create({
      data: { ...dto },
    });
  }

  async getRequestedJobCards(): Promise<RequestedJobCard[]> {
    return await this.data.requestedJobCard.findMany({
      include: {
        jobCard: {
          include: { user: { include: { photo: true, profile: true } } },
        },
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  deleteTemporaryFiles(): void {
    const directory = join(process.cwd(), 'tmp');
    if (existsSync(directory)) {
      this.logger.verbose('Removing temporary files!');
      rmdirSync(directory, { recursive: true });
    }
  }
}
