import { Global, Module } from '@nestjs/common';
import WsService from 'services/ws.service';

@Global()
@Module({
  providers: [WsService],
  exports: [WsService],
})
export default class WebsocketModule {}
