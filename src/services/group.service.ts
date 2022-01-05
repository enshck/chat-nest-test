import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import fs = require('fs');
import { Op } from 'sequelize';

import { dbTables } from 'const/dbTables';
import Group from 'models/Group';
import User from 'models/User';
import UserGroup from 'models/UserGroup';
import { IResponseMessage } from 'interfaces/responseMessage';
import { IGroupsResponse } from 'controllers/group.controller';
import createGroupDto from 'dto/chat/createGroup.dto';
import updateGroupDto from 'dto/chat/updateGroup.dto';
import variables from 'config/variables';
import getExtension from 'utils/getExtension';
import { groupsImagesExtensions } from 'validation/fileUpload';
import WsService from './ws.service';

@Injectable()
class GroupService {
  constructor(
    @Inject(dbTables.GROUP_TABLE) private groupTable: typeof Group,
    @Inject(dbTables.USER_TABLE) private userTable: typeof User,
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
    private readonly wsService: WsService,
  ) {}

  private async changeUserInRoom(
    userId: string,
    groupId: string,
    isUserShouldJoin: boolean,
  ) {
    const currentUser = await this.userTable.findOne({
      where: {
        id: userId,
      },
    });

    const socketId = currentUser.getDataValue('socketId');

    if (!socketId) {
      throw new InternalServerErrorException('Internal server error');
    }

    if (isUserShouldJoin) {
      this.wsService.server.in(socketId).socketsJoin(groupId);
    } else {
      this.wsService.server.in(socketId).socketsLeave(groupId);
    }
  }

  async getGroups(req): Promise<IGroupsResponse> {
    const user = await this.userTable.findOne({
      where: {
        id: req?.userId,
      },
      include: [
        {
          association: 'groups',
          attributes: ['id', 'name', 'avatar'],
          through: {
            attributes: [],
          },
          include: [
            {
              association: 'messages',
              attributes: ['id', 'content'],
              limit: 1,
              order: [['createdAt', 'DESC']],
            },
          ],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const groupsData = user.getDataValue('groups');

    const updatedGroupsData = groupsData.map((elem) => {
      const elemData = elem.get();

      return elemData;
    });

    return {
      data: updatedGroupsData,
    };
  }

  async createGroup(
    data: createGroupDto,
    userId: string,
  ): Promise<IResponseMessage> {
    const result = await this.groupTable.create({
      ...data,
      creatorId: userId,
    });

    const groupId = result.getDataValue('id');

    await this.userGroupTable.create({
      groupId,
      userId,
    });

    await this.changeUserInRoom(userId, groupId, true);

    return {
      message: 'Group created',
    };
  }

  async joinToGroup(
    groupId: string,
    userId: string,
  ): Promise<IResponseMessage> {
    if (!groupId) {
      throw new BadRequestException('groupId is required');
    }

    const result = await this.userGroupTable.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (result) {
      throw new BadRequestException('You are already in group');
    }

    await this.userGroupTable.create({
      groupId,
      userId,
    });

    await this.changeUserInRoom(userId, groupId, true);

    return {
      message: 'User has joined in group',
    };
  }

  async leaveFromGroup(
    groupId: string,
    userId: string,
  ): Promise<IResponseMessage> {
    if (!groupId) {
      throw new BadRequestException('groupId is required');
    }

    const result = await this.userGroupTable.findOne({
      where: {
        groupId,
        userId,
      },
    });

    if (!result) {
      throw new BadRequestException(`You're not in group`);
    }

    await result.destroy();

    await this.changeUserInRoom(userId, groupId, false);

    return {
      message: 'User has deleted from group',
    };
  }

  async updateGroup(
    data: updateGroupDto,
    userId: string,
  ): Promise<IResponseMessage> {
    const currentGroup = await this.groupTable.findOne({
      where: {
        id: data.groupId,
        creatorId: userId,
      },
    });

    if (!currentGroup) {
      throw new NotFoundException('Element not found');
    }

    await currentGroup.update(data);

    return {
      message: 'Group updated',
    };
  }

  async searchGroups(search: string, req): Promise<IGroupsResponse> {
    const { userId } = req;
    if (!search?.length) {
      throw new BadRequestException('Search string is required');
    }

    const groupsIdWithCurrentUser = (
      await this.userGroupTable.findAll({
        where: {
          userId,
        },
        attributes: ['groupId'],
      })
    ).map((elem) => elem.get()?.groupId);

    const groups = await this.groupTable.findAll({
      attributes: ['id', 'name', 'avatar'],
      where: {
        name: {
          [Op.iLike]: `%${search}%`,
        },
        id: {
          [Op.notIn]: groupsIdWithCurrentUser,
        },
      },
    });

    return {
      data: groups,
    };
  }

  async updateAvatar(
    file: Express.Multer.File,
    req,
  ): Promise<IResponseMessage> {
    const groupId = req.query.groupId;

    if (!groupId) {
      throw new BadRequestException('Group id has not recieved');
    }

    const group = await this.groupTable.findOne({
      where: {
        creatorId: req.userId,
        id: groupId,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    const groupData = group.get();
    const fileExtension = getExtension(file?.mimetype || '');

    if (!groupsImagesExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'Incorrect file format. Only jpg and png files',
      );
    }

    const fileName = `${groupData.id}.${fileExtension}`;

    fs.writeFile(
      `.${variables.staticDirectory}${variables.groupImagesDirectory}/${fileName}`,
      file.buffer,
      (err) => {
        console.log(err, 'group avatar save error');
      },
    );

    group.update({
      avatar: fileName,
    });

    return {
      message: 'File uploaded',
    };
  }
}

export default GroupService;
