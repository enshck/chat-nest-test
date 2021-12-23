import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
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
import getHost from 'utils/getHost';

@Injectable()
class GroupService {
  constructor(
    @Inject(dbTables.GROUP_TABLE) private groupTable: typeof Group,
    @Inject(dbTables.USER_TABLE) private userTable: typeof User,
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
  ) {}

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

      return {
        ...elemData,
        avatar: `${getHost(req.hostName)}${variables.groupImagesDirectory}/${
          elemData.avatar
        }`,
      };
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
      throw new BadRequestException('You are alredy in group');
    }

    await this.userGroupTable.create({
      groupId,
      userId,
    });

    return {
      message: 'User has joined in group',
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

  async searchGroups(search: string, userId: string): Promise<IGroupsResponse> {
    if (!search?.length) {
      throw new BadRequestException('Search string is required');
    }

    const groups = await this.groupTable.findAll({
      attributes: ['id', 'name', 'avatar'],
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
      },
    });

    console.log(groups, 'user');

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
