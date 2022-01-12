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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiHeader,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { controllerPaths, authPaths } from 'const/routes';
import AuthService from 'services/auth.service';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { registrationSchema, loginSchema } from 'validation/auth';
import createUserDto from 'dto/auth/createUser.dto';
import loginDto from 'dto/auth/login.dto';
import AuthGuard from 'guards/auth.guard';
import { ResponseMessage } from 'interfaces/responseMessage';

export interface IAuthResponse {
  email: string;
  token: string;
  userName: string;
}

class LoginResponse {
  @ApiProperty()
  token: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  email: string;
}

// SWAGGER
@ApiBearerAuth()
@ApiTags('Authorization')
// SWAGGER
@Controller(controllerPaths.AUTH)
class AuthController {
  constructor(private readonly authService: AuthService) {}

  // SWAGGER
  @ApiOperation({ summary: 'Create new user' })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'Sign up',
  })
  @ApiBadRequestResponse({ description: 'User already exist' })
  @ApiInternalServerErrorResponse({ description: 'Internal server Error' })
  // SWAGGER
  @Post(authPaths.REGISTRATION)
  @UsePipes(new JoiValidationPipe(registrationSchema))
  async registration(@Body() body: createUserDto) {
    return this.authService.createUser(body);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Login as existing user' })
  @ApiOkResponse({
    type: LoginResponse,
    description: 'Login',
  })
  @ApiBadRequestResponse({ description: 'User already exist' })
  @ApiUnauthorizedResponse({ description: 'Invalid Credentials' })
  @ApiInternalServerErrorResponse({ description: 'Internal server Error' })
  // SWAGGER
  @Post(authPaths.LOGIN)
  @UsePipes(new JoiValidationPipe(loginSchema))
  async login(@Body() body: loginDto) {
    return this.authService.login(body);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Logout as existing user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Json Web Token',
    required: true,
  })
  @ApiOkResponse({
    description: 'User logouted',
    type: ResponseMessage,
  })
  @ApiBadRequestResponse({ description: 'User is not exist' })
  @ApiInternalServerErrorResponse({ description: 'Internal server Error' })
  // SWAGGER
  @UseGuards(AuthGuard)
  @Put(authPaths.LOGOUT)
  async logout(@Req() req: Request) {
    return this.authService.logout(req);
  }
}

export default AuthController;
