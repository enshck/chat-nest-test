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
import AuthGuard from 'guards/auth.guard';
import { privateMessagePaths } from 'const/routes';
import CreatePrivateMessage from 'dto/chat/createPrivateMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema } from 'validation/privateMessage';
import PrivateMessageService from 'services/privateMessage.service';
import PrivateMessage from 'models/PrivateMessage';

export interface IMessagesResponse {
  data: PrivateMessage[];
  pagination: {
    nextCursor: string | null;
  };
}

@Controller(controllerPaths.PRIVATE_MESSAGE)
class PrivateMessagesController {
  constructor(private readonly privateMessageService: PrivateMessageService) {}

  @Post(privateMessagePaths.CREATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(messageSchema))
  async createMessage(@Body() body: CreatePrivateMessage, @Req() req) {
    return this.privateMessageService.createPrivateMessage(body, req);
  }

  @Get(privateMessagePaths.GET_MESSAGES)
  @UseGuards(AuthGuard)
  async getMessages(
    @Query('userId') userId: string,
    @Query('nextCursor') cursor: string,
    @Req() req,
  ) {
    return this.privateMessageService.getMessages(userId, req, cursor);
  }
}

export default PrivateMessagesController;
