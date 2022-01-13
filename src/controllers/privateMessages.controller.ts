import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Post,
  Body,
  UsePipes,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiHeader,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { controllerPaths } from 'const/routes';
import AuthGuard from 'guards/auth.guard';
import { privateMessagePaths } from 'const/routes';
import CreatePrivateMessageDto from 'dto/chat/createPrivateMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema, updateMessageSchema } from 'validation/privateMessage';
import PrivateMessageService from 'services/privateMessage.service';
import PrivateMessage from 'models/PrivateMessage';
import UpdatePrivateMessageDto from 'dto/chat/updatePrivateMessage.dto';
import { ResponseMessage } from 'interfaces/responseMessage';
import { PaginationData } from 'interfaces/responseData';

export interface IMessagesResponse {
  data: PrivateMessage[];
  pagination: {
    nextCursor: string | null;
  };
}

class AuthorData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  avatar: string;
}

class MessageData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  author: AuthorData;
}

class MessagesDataResponse {
  @ApiProperty({
    isArray: true,
  })
  data: MessageData;

  @ApiProperty()
  pagination: PaginationData;
}

@ApiBearerAuth()
@ApiTags('Private messages to user')
@ApiHeader({
  name: 'Authorization',
  description: 'Json Web Token',
  required: true,
})
@ApiUnauthorizedResponse({ description: 'Invalid Token' })
@ApiInternalServerErrorResponse({ description: 'Internal server Error' })
@Controller(controllerPaths.PRIVATE_MESSAGE)
class PrivateMessagesController {
  constructor(private readonly privateMessageService: PrivateMessageService) {}

  // SWAGGER
  @ApiOperation({ summary: 'Create private message to user' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Message created',
  })
  // SWAGGER
  @Post(privateMessagePaths.CREATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(messageSchema))
  async createMessage(@Body() body: CreatePrivateMessageDto, @Req() req) {
    return this.privateMessageService.createPrivateMessage(body, req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Get private messages with another user' })
  @ApiOkResponse({
    type: MessagesDataResponse,
    description: 'Getting messages',
  })
  // SWAGGER
  @Get(privateMessagePaths.GET_MESSAGES)
  @UseGuards(AuthGuard)
  async getMessages(
    @Query('userId') userId: string,
    @Query('nextCursor') cursor: string,
    @Req() req,
  ) {
    return this.privateMessageService.getMessages(userId, req, cursor);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Update private message' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Message has updated',
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  // SWAGGER
  @Put(privateMessagePaths.UPDATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateMessageSchema))
  async updateMessage(@Body() data: UpdatePrivateMessageDto, @Req() req) {
    return this.privateMessageService.updatePrivateMessage(data, req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Delete private message' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Message has deleted',
  })
  @ApiNotFoundResponse({
    description: 'Message not found',
  })
  // SWAGGER
  @Delete(privateMessagePaths.DELETE_MESSAGE)
  @UseGuards(AuthGuard)
  async deleteMessage(@Query('messageId') messageId: string, @Req() req) {
    return this.privateMessageService.deletePrivateMessage(messageId, req);
  }
}

export default PrivateMessagesController;
