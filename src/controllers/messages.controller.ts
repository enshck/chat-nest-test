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

import { controllerPaths } from 'const/routes';
import MessageService from 'services/messages.service';
import AuthGuard from 'guards/auth.guard';
import Message from 'models/Message';
import { messagePaths } from 'const/routes';
import CreateMessage from 'dto/chat/createMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema, updateMessageSchema } from 'validation/message';
import UpdateMessage from 'dto/chat/updateMessage.dto';

export interface IMessagesResponse {
  data: Message[];
}

@Controller(controllerPaths.MESSAGE)
class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @Get(messagePaths.GET_MESSAGES_FOR_GROUP)
  @UseGuards(AuthGuard)
  async getGroups(@Req() req, @Query('groupId') groupId: string) {
    return this.messageService.getMessagesForGroup(req, groupId);
  }

  @Post(messagePaths.CREATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(messageSchema))
  async createMessage(@Req() req, @Body() messageData: CreateMessage) {
    return this.messageService.createMessage(req.userId, messageData);
  }

  @Put(messagePaths.UPDATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateMessageSchema))
  async updateMessage(@Req() req, @Body() messageData: UpdateMessage) {
    return this.messageService.updateMessage(req.userId, messageData);
  }

  @Delete(messagePaths.DELETE_MESSAGE)
  @UseGuards(AuthGuard)
  async deleteMessage(@Req() req, @Query('messageId') messageId: string) {
    return this.messageService.deleteMessage(req.userId, messageId);
  }
}

export default MessagesController;
