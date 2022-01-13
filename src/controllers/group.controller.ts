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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

import { controllerPaths } from 'const/routes';
import GroupService from 'services/group.service';
import AuthGuard from 'guards/auth.guard';
import Group from 'models/Group';
import JoiValidationPipe from 'pipes/joiValidation.pipe';
import { createGroupSchema, updateGroupSchema } from 'validation/group';
import CreateGroupDto from 'dto/chat/createGroup.dto';
import UpdateGroupDto from 'dto/chat/updateGroup.dto';
import { groupPaths } from 'const/routes';
import { ResponseMessage } from 'interfaces/responseMessage';

export interface IGroupsResponse {
  data: Group[];
}

class GroupElement {
  @ApiProperty()
  avatar: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  lastMessage: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  lastMessageCreatedAt: string;

  @ApiProperty()
  name: string;
}

class GroupData {
  @ApiProperty({
    isArray: true,
  })
  data: GroupElement;
}

@ApiBearerAuth()
@ApiTags('Group')
@ApiHeader({
  name: 'Authorization',
  description: 'Json Web Token',
  required: true,
})
@ApiUnauthorizedResponse({ description: 'Invalid Token' })
@ApiInternalServerErrorResponse({ description: 'Internal server Error' })
@Controller(controllerPaths.GROUP)
class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // SWAGGER
  @ApiOperation({ summary: 'Get groups for current user' })
  @ApiOkResponse({
    type: GroupData,
    description: 'Array of Groups',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  // SWAGGER
  @Get(groupPaths.GET_GROUPS)
  @UseGuards(AuthGuard)
  async getGroups(@Req() req) {
    return this.groupService.getGroups(req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Create new group and join current user' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Group has created',
  })
  // SWAGGER
  @Post(groupPaths.CREATE_GROUP)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(createGroupSchema))
  async createGroup(@Req() req, @Body() body: CreateGroupDto) {
    return this.groupService.createGroup(body, req.userId);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Update existing group' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'Group has updated',
  })
  @ApiNotFoundResponse({ description: 'Element not found' })
  // SWAGGER
  @Put(groupPaths.UPDATE_GROUP)
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateGroupSchema))
  async updateGroup(@Req() req, @Body() body: UpdateGroupDto) {
    return this.groupService.updateGroup(body, req.userId);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Upload avatar for group' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'File uploaded',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({
    description: 'Group id has not recieved',
  })
  // SWAGGER
  @Put(groupPaths.UPDATE_AVATAR)
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Query('groupId') groupId: string,
    @Req() req,
  ) {
    return this.groupService.updateAvatar(file, groupId, req);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Join user to existing group' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'User has joined in group',
  })
  @ApiNotFoundResponse({ description: 'Element not found' })
  @ApiBadRequestResponse({
    description: 'groupId is required',
  })
  // SWAGGER
  @Patch(groupPaths.JOIN_GROUP)
  @UseGuards(AuthGuard)
  async joinGroup(@Req() req, @Query('groupId') groupId: string) {
    return this.groupService.joinToGroup(groupId, req.userId);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Leave user from existing group' })
  @ApiOkResponse({
    type: ResponseMessage,
    description: 'User has deleted from group',
  })
  @ApiBadRequestResponse({
    description: "You're not in group",
  })
  // SWAGGER
  @Patch(groupPaths.LEAVE_FROM_GROUP)
  @UseGuards(AuthGuard)
  async leaveFromGroup(@Req() req, @Query('groupId') groupId: string) {
    return this.groupService.leaveFromGroup(groupId, req.userId);
  }

  // SWAGGER
  @ApiOperation({ summary: 'Search groups by search string' })
  @ApiOkResponse({
    type: GroupData,
    description: 'Search groups by search string',
  })
  @ApiBadRequestResponse({
    description: 'Search string is required',
  })
  // SWAGGER
  @Get(groupPaths.SEARCH_GROUPS)
  @UseGuards(AuthGuard)
  async searchGroups(@Req() req, @Query('search') search: string) {
    return this.groupService.searchGroups(search, req);
  }
}

export default GroupController;
