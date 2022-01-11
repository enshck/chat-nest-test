import { Module } from '@nestjs/common';

import PrivateMessageService from 'services/privateMessage.service';
import PrivateMessagesController from 'controllers/privateMessages.controller';

@Module({
  controllers: [PrivateMessagesController],
  providers: [PrivateMessageService],
})
export default class MessagesModule {}
