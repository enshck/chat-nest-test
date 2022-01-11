import { Module } from '@nestjs/common';

import GroupModule from './group.module';
import MessagesModule from './messages.module';
import PrivateMessagesModule from './privateMessages.module';

@Module({
  imports: [MessagesModule, GroupModule, PrivateMessagesModule],
})
export default class ChatModule {}
