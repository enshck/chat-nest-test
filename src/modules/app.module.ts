import { Module } from '@nestjs/common';
import DatabaseModule from './database.module';
import UserModule from './user.module';
import StaticServeModule from './serveStatic.module';
import ChatModule from './chat.module.ts';
import WebsocketModule from './ws.module';

@Module({
  imports: [
    DatabaseModule,
    StaticServeModule,
    UserModule,
    ChatModule,
    WebsocketModule,
  ],
})
export class AppModule {}
