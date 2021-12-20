import {
  Controller,
  Post,
  UsePipes,
  Body,
  Put,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';

import { controllerPaths, authPaths } from 'const/routes';
import AuthService from 'services/auth.service';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { registrationSchema, loginSchema } from 'validation/auth';
import createUserDto from 'dto/auth/createUser.dto';
import loginDto from 'dto/auth/login.dto';
import AuthGuard from 'guards/auth.guard';

export interface IAuthResponse {
  email: string;
  token: string;
  userName: string;
}

@Controller(controllerPaths.AUTH)
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(authPaths.REGISTRATION)
  @UsePipes(new JoiValidationPipe(registrationSchema))
  async registration(@Body() body: createUserDto) {
    return this.authService.createUser(body);
  }

  @Post(authPaths.LOGIN)
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(@Body() body: loginDto) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Put(authPaths.LOGOUT)
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }
}

export default AuthController;
