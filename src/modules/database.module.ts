import { Module, Global } from '@nestjs/common';
import { databaseServices } from 'services/database.service';

@Global()
@Module({
  providers: databaseServices,
  exports: databaseServices,
})
export default class DatabaseModule {}
