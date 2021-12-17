import { Controller, Post, UsePipes, Body, Headers, Get } from '@nestjs/common';

import { controllerPaths, authPaths } from 'const/routes';
import AuthService from 'services/auth.service';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { registrationSchema } from 'validation/auth';
import createUserDto from 'dto/createUserDto';

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
}

export default AuthController;
