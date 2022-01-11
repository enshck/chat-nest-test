import { Module } from '@nestjs/common';

import GroupModule from './group.module';
import MessagesModule from './messages.module';

@Module({
  imports: [MessagesModule, GroupModule],
})
export default class ChatModule {}
