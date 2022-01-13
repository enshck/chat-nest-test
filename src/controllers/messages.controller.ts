import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Post,
  Body,
  UsePipes,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiHeader,
} from '@nestjs/swagger';

import { controllerPaths } from 'const/routes';
import MessageService from 'services/messages.service';
import AuthGuard from 'guards/auth.guard';
import Message from 'models/Message';
import { messagePaths } from 'const/routes';
import CreateMessage from 'dto/chat/createMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema, updateMessageSchema } from 'validation/message';
import UpdateMessage from 'dto/chat/updateMessage.dto';
import { PaginationData } from 'interfaces/responseData';
import { ResponseMessage } from 'interfaces/responseMessage';

export interface IMessagesResponse {
  data: Message[];
  pagination: {
    nextCursor: string | null;
  };
}

class AuthorData {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

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
@ApiTags('Message')
@ApiHeader({
  name: 'Authorization',
  description: 'Json Web Token',
  required: true,
})
@ApiUnauthorizedResponse({ description: 'Invalid Token' })
@ApiInternalServerErrorResponse({ description: 'Internal server Error' })
@Controller(controllerPaths.MESSAGE)
class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  // SWAGGER
  @ApiOperation({ summary: 'Get messages for existing group' })
  @ApiOkResponse({
    type: MessagesDataResponse,
    description: 'Array of Messages',
  })
  @ApiBadRequestResponse({ description: "You're not in group" })
  // SWAGGER
  @Get(messagePaths.GET_MESSAGES_FOR_GROUP)
  @UseGuards(AuthGuard)
  async getGroups(
    @Req() req,
    @Query('groupId') groupId: string,
    @Query('nextCursor') cursor: string,
  ) {
    return this.messageService.getMessagesForGroup(req, groupId, cursor);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Create message' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'New message has created',
  })
  @ApiUnauthorizedResponse({ description: "You're not in group" })
  // SWAGGER
  @Post(messagePaths.CREATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(messageSchema))
  async createMessage(@Req() req, @Body() messageData: CreateMessage) {
    return this.messageService.createMessage(req.userId, messageData);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Update message by id' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Message has updated',
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  // SWAGGER
  @Put(messagePaths.UPDATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateMessageSchema))
  async updateMessage(@Req() req, @Body() messageData: UpdateMessage) {
    return this.messageService.updateMessage(req.userId, messageData);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Delete message by id' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Message has deleted',
  })
  @ApiNotFoundResponse({ description: 'Message not found' })
  // SWAGGER
  @Delete(messagePaths.DELETE_MESSAGE)
  @UseGuards(AuthGuard)
  async deleteMessage(@Req() req, @Query('messageId') messageId: string) {
    return this.messageService.deleteMessage(req.userId, messageId);
  }
}

export default MessagesController;
