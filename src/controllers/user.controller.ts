import {
  Controller,
  Get,
  UseGuards,
  Req,
  Request,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import fs = require('fs');

import { controllerPaths, userPaths } from 'const/routes';
import UserService from 'services/user.sevice';
import AuthGuard from 'guards/auth.guard';
import updateUserDto from 'dto/user/updateUser.dto';

export interface IAuthResponse {
  email: string;
  token: string;
  userName: string;
}

@Controller(controllerPaths.USER)
class AuthController {
  constructor(private readonly userService: UserService) {}

  @Get(userPaths.GET_USER)
  @UseGuards(AuthGuard)
  async getUser(@Req() req: Request) {
    return this.userService.getUserData(req);
  }

  @Put(userPaths.UPDATE_USER)
  @UseGuards(AuthGuard)
  async updateUser(@Body() body: updateUserDto, @Req() req: Request) {
    return this.userService.updateUserData(body, req);
  }

  @Put(userPaths.UPDATE_AVATAR)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    // fs.writeFile(__dirname, file.buffer, () => {});

    return 'qwe';
  }
}

export default AuthController;
