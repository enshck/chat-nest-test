import { Module } from '@nestjs/common';

import GroupService from 'services/group.service';
import GroupController from 'controllers/group.controller';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
})
export default class GroupModule {}
