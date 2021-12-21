import { Module } from '@nestjs/common';
import DatabaseModule from './database.module';
import UserModule from './user.module';
import StaticServeModule from './serveStatic.module';

@Module({
  imports: [DatabaseModule, StaticServeModule, UserModule],
})
export class AppModule {}
