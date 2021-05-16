import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AppService } from './app.service';
import { IMAGE_FILE_OPTIONS } from './config/constants';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('user/random')
  async getRandomUser() {
    return this.appService.getRandomUser();
  }

  @Put('user/address')
  async updateUserAddress() {
    return; // TODO: Método sin implementar
  }

  @Post('file/upload')
  @UseInterceptors(FileInterceptor('file', IMAGE_FILE_OPTIONS))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.appService.uploadFile(file);
  }

  @Get('file/download/:fileName')
  async readFile(@Param('fileName') fileName: string, @Res() res: Response) {
    return this.appService.downloadFile(fileName, res);
  }

  @Post('request/job-card')
  async newRequest() {
    return; // TODO: Método sin implementar
  }

  @Get('request/job-card')
  async getRequests() {
    return; // TODO: Método sin implementar
  }
}
