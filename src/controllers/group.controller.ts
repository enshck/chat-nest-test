import {
  Controller,
  Get,
  UseGuards,
  Req,
  Body,
  Post,
  UsePipes,
  Put,
  UploadedFile,
  UseInterceptors,
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { controllerPaths } from 'const/routes';
import GroupService from 'services/group.service';
import AuthGuard from 'guards/auth.guard';
import Group from 'models/Group';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { createGroupSchema, updateGroupSchema } from 'validation/group';
import createGroupDto from 'dto/chat/createGroup.dto';
import updateGroupDto from 'dto/chat/updateGroup.dto';
import { groupPaths } from 'const/routes';

export interface IGroupsResponse {
  data: Group[];
}

@Controller(controllerPaths.GROUP)
class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(groupPaths.GET_GROUPS)
  @UseGuards(AuthGuard)
  async getGroups(@Req() req) {
    return this.groupService.getGroups(req);
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

  @Put(groupPaths.UPDATE_AVATAR)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.groupService.updateAvatar(file, req);
  }

  @Patch(groupPaths.JOIN_GROUP)
  @UseGuards(AuthGuard)
  async joinGroup(@Req() req, @Query('groupId') groupId) {
    return this.groupService.joinToGroup(groupId, req.userId);
  }

  @Patch(groupPaths.LEAVE_FROM_GROUP)
  @UseGuards(AuthGuard)
  async leaveFromGroup(@Req() req, @Query('groupId') groupId) {
    return this.groupService.leaveFromGroup(groupId, req.userId);
  }

  @Get(groupPaths.SEARCH_GROUPS)
  @UseGuards(AuthGuard)
  async searchGroups(@Req() req, @Query('search') search) {
    return this.groupService.searchGroups(search, req);
  }
}

export default GroupController;
