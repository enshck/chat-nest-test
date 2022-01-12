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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  ApiNotFoundResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';

import { controllerPaths, userPaths } from 'const/routes';
import UserService from 'services/user.sevice';
import AuthGuard from 'guards/auth.guard';
import updateUserDto from 'dto/user/updateUser.dto';
import { ResponseMessage } from 'interfaces/responseMessage';

export interface IAuthResponse {
  email: string;
  token: string;
  userName: string;
}

class GetUsersBySearchString {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  avatar: string | null;
}
class GetUserResponse extends GetUsersBySearchString {
  @ApiProperty()
  email: string;
}

class UserAfterUpdatingResponse {
  @ApiProperty()
  email: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  id: string;
}

// SWAGGER
@ApiBearerAuth()
@ApiTags('User')
@ApiHeader({
  name: 'Authorization',
  description: 'Json Web Token',
  required: true,
})
@ApiInternalServerErrorResponse({ description: 'Internal server Error' })
// SWAGGER
@Controller(controllerPaths.USER)
class AuthController {
  constructor(private readonly userService: UserService) {}

  // SWAGGER
  @ApiOperation({ summary: 'Get authorized user' })
  @ApiOkResponse({
    type: GetUserResponse,
    description: 'Current User',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  // SWAGGER
  @Get(userPaths.GET_USER)
  @UseGuards(AuthGuard)
  async getUser(@Req() req: Request) {
    return this.userService.getUserData(req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Update of existing user' })
  @ApiOkResponse({
    type: UserAfterUpdatingResponse,
    description: 'User after updating',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: 'Change another email' })
  // SWAGGER
  @Put(userPaths.UPDATE_USER)
  @UseGuards(AuthGuard)
  async updateUser(@Body() body: updateUserDto, @Req() req: Request) {
    return this.userService.updateUserData(body, req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Upload avatar for user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Avatar has updated',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({
    description: 'Incorrect file format. Only jpg and png files',
  })
  // SWAGGER
  @Put(userPaths.UPDATE_AVATAR)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.updateAvatar(file, req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Search users by search string' })
  @ApiQuery({
    name: 'search',
    required: true,
    type: 'string',
  })
  @ApiOkResponse({
    type: [GetUsersBySearchString],
    description: 'Array of users',
  })
  @ApiBadRequestResponse({
    description: 'Search string is required',
  })
  // SWAGGER
  @Get(userPaths.SEARCH_USERS)
  @UseGuards(AuthGuard)
  async searchUsers(@Query('search') search, @Req() req) {
    return this.userService.searchUsers(req, search);
  }
}

export default AuthController;
