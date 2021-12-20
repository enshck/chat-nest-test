import {
  Controller,
  Get,
  UseGuards,
  Req,
  Request,
  Put,
  Body,
} from '@nestjs/common';

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
}

export default AuthController;
