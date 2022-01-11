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
} from '@nestjs/common';

import { controllerPaths } from 'const/routes';
import AuthGuard from 'guards/auth.guard';
import { privateMessagePaths } from 'const/routes';
import CreatePrivateMessage from 'dto/chat/createPrivateMessage.dto';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { messageSchema, updateMessageSchema } from 'validation/privateMessage';
import PrivateMessageService from 'services/privateMessage.service';
import PrivateMessage from 'models/PrivateMessage';
import UpdatePrivateMessage from 'dto/chat/updatePrivateMessage.dto';

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

  @Post(privateMessagePaths.UPDATE_MESSAGE)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateMessageSchema))
  async updateMessage(@Body() data: UpdatePrivateMessage, @Req() req) {
    return this.privateMessageService.updatePrivateMessage(data, req);
  }

  @Delete(privateMessagePaths.DELETE_MESSAGE)
  @UseGuards(AuthGuard)
  async deleteMessage(@Query('messageId') messageId: string, @Req() req) {
    return this.privateMessageService.deletePrivateMessage(messageId, req);
  }
}

export default PrivateMessagesController;
