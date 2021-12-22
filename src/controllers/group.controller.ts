import {
  Controller,
  Get,
  UseGuards,
  Req,
  Body,
  Post,
  UsePipes,
  Put,
} from '@nestjs/common';
import { groupPaths } from 'const/routes';

import { controllerPaths } from 'const/routes';
import GroupService from 'services/group.service';
import AuthGuard from 'guards/auth.guard';
import Group from 'models/Group';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { createGroupSchema, updateGroupSchema } from 'validation/group';
import createGroupDto from 'dto/chat/createGroup.dto';
import updateGroupDto from 'dto/chat/updateGroup.dto';

export interface IGroupsResponse {
  data: Group[];
}

@Controller(controllerPaths.GROUP)
class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(groupPaths.GET_GROUPS)
  @UseGuards(AuthGuard)
  async getGroups(@Req() req) {
    return this.groupService.getGroups(req.userId);
  }

  @Post(groupPaths.CREATE_GROUP)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createGroupSchema))
  async createGroup(@Body() body: createGroupDto, @Req() req) {
    return this.groupService.createGroup(body, req.userId);
  }

  @Put(groupPaths.UPDATE_GROUP)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateGroupSchema))
  async updateGroup(@Body() body: updateGroupDto, @Req() req) {
    return this.groupService.updateGroup(body, req.userId);
  }
}

export default GroupController;
