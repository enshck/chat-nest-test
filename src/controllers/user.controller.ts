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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { controllerPaths, userPaths } from 'const/routes';
import UserService from 'services/user.sevice';
import AuthGuard from 'guards/auth.guard';
import updateUserDto from 'dto/user/updateUser.dto';
import variables from 'config/variables';
import getExtension from 'utils/getExtension';
import { avatarExtensions } from 'validation/fileUpload';

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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `.${variables.staticDirectory}${variables.avatarDirectory}`,
        filename: (req: any, file, cb) => {
          const extension = getExtension(file?.mimetype || '');
          cb(null, `${req?.userId}.${extension}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        const extension = getExtension(file?.mimetype || '');

        if (avatarExtensions.includes(extension)) {
          cb(null, true);
          return;
        }

        cb(null, false);
      },
    }),
  )
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.updateAvatar(file, req);
  }
}

export default AuthController;
