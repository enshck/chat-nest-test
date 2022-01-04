import { Module } from '@nestjs/common';
import DatabaseModule from './database.module';
import UserModule from './user.module';
import MessagesModule from './messages.module';
import StaticServeModule from './serveStatic.module';
import ChatModule from './chat.module';

@Module({
  imports: [
    DatabaseModule,
    StaticServeModule,
    UserModule,
    ChatModule,
    MessagesModule,
  ],
})
export class AppModule {}
