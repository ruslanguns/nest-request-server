import {
  Body,
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
import { CreateUserAddressDTO } from './dto/create-user-address.dto';
import { RequestJobCardDTO } from './dto/request-new-card.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('user/random')
  async getRandomUser() {
    return await this.appService.getRandomUser();
  }

  @Put('user/address')
  async updateUserAddress(@Body() dto: CreateUserAddressDTO) {
    return await this.appService.addUserAddress(dto);
  }

  @Put('user/photo/:userId')
  @UseInterceptors(FileInterceptor('file', IMAGE_FILE_OPTIONS))
  async updateUserProfilePhoto(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.appService.updateUserProfilePhoto(userId, file);
  }

  @Get('user/:userId')
  async getUserById(@Param('userId') userId: string) {
    return await this.appService.getUserById(userId);
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
  async newRequest(@Body() dto: RequestJobCardDTO) {
    return await this.appService.requestJobCard(dto);
  }

  @Get('request/job-card')
  async getRequests() {
    return await this.appService.getRequestedJobCards();
  }
}
