import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Post,
  Body,
  UsePipes,
} from '@nestjs/common';

import { controllerPaths } from 'const/routes';
import MessageService from 'services/messages.service';
import AuthGuard from 'guards/auth.guard';
import Message from 'models/Message';
import { messagePaths } from 'const/routes';
import CreateMessage from 'dto/chat/createMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema } from 'validation/message';

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
}

export default MessagesController;
