import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { dbTables } from 'const/dbTables';
import Group from 'models/Group';
import User from 'models/User';
import UserGroup from 'models/UserGroup';
import { IResponseMessage } from 'interfaces/responseMessage';
import { IGroupsResponse } from 'controllers/group.controller';
import createGroupDto from 'dto/chat/createGroup.dto';
import updateGroupDto from 'dto/chat/updateGroup.dto';

@Injectable()
class GroupService {
  constructor(
    @Inject(dbTables.GROUP_TABLE) private groupTable: typeof Group,
    @Inject(dbTables.USER_TABLE) private userTable: typeof User,
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
  ) {}

  async getGroups(userId: string): Promise<IGroupsResponse> {
    const user = await this.userTable.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          association: 'groups',
          attributes: ['id', 'name', 'description', 'avatar'],
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

    return {
      data: groupsData,
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

    return {
      message: 'Group created',
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
}

export default GroupService;
