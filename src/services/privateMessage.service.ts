import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Op, Includeable } from 'sequelize';

import { dbTables } from 'const/dbTables';
import PrivateMessage from 'models/PrivateMessage';
import PrivateGroup from 'models/PrivateGroup';
import PrivateGroupUser from 'models/PrivateGroupUser';
import { IResponseMessage } from 'interfaces/responseMessage';
import CreatePrivateMessage from 'dto/chat/createPrivateMessage.dto';
import User from 'models/User';
import { IMessagesResponse } from '../controllers/privateMessages.controller';
import UpdatePrivateMessage from 'dto/chat/updatePrivateMessage.dto';
import WsService from 'services/ws.service';
import { privateMessageEventTypes } from 'const/wsTypes';

interface IGroup {
  id: string;
  lastMessage: string;
  users: string[];
  messages: PrivateMessage[];
}

@Injectable()
class PrivateMessageService {
  constructor(
    @Inject(dbTables.PRIVATE_MESSAGE_TABLE)
    private messageTable: typeof PrivateMessage,
    @Inject(dbTables.PRIVATE_GROUP_TABLE)
    private groupTable: typeof PrivateGroup,
    @Inject(dbTables.PRIVATE_GROUP_USER_TABLE)
    private groupUserTable: typeof PrivateGroupUser,
    @Inject(dbTables.USER_TABLE)
    private userTable: typeof User,
    private wsService: WsService,
  ) {}

  private getGroupsByUser(currentUser: User) {
    const privateGroups: IGroup[] = currentUser
      .getDataValue('privateGroups')
      .map((elem: PrivateGroup) => {
        const data: PrivateGroup = elem.get();

        return {
          ...data,
          users: data.users.map((elem) => elem.get()?.id),
        };
      });

    return privateGroups;
  }

  async createPrivateMessage(
    body: CreatePrivateMessage,
    req,
  ): Promise<IResponseMessage> {
    const { userId: senderUserId } = req;
    const { content, userId } = body;

    const currentUser = await this.userTable.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          association: 'privateGroups',
          include: [
            {
              association: 'users',
            },
          ],
        },
      ],
    });

    const privateGroups = this.getGroupsByUser(currentUser);

    const existingGroup = privateGroups.find((elem) =>
      elem.users.includes(userId),
    );

    let existingGroupId = existingGroup?.id;

    if (!existingGroupId) {
      const result = await this.groupTable.create({});

      const idOfNewGroup = result.getDataValue('id');

      await this.groupUserTable.bulkCreate([
        {
          groupId: idOfNewGroup,
          userId: senderUserId,
        },
        {
          groupId: idOfNewGroup,
          userId,
        },
      ]);

      existingGroupId = idOfNewGroup;
    }

    const message = await this.messageTable.create({
      content,
      authorId: senderUserId,
      groupId: existingGroupId,
    });

    const senderUser = await this.userTable.findOne({
      where: {
        id: senderUserId,
      },
      attributes: ['id', 'userName', 'avatar'],
    });

    const socketId = currentUser.getDataValue('socketId');

    const { id, createdAt } = message.get();

    this.wsService.server
      .in(socketId)
      .emit(privateMessageEventTypes.NEW_PRIVATE_MESSAGE, {
        data: {
          user: senderUser,
          message: {
            id,
            content,
            createdAt,
          },
        },
      });

    return {
      message: 'Message created',
    };
  }

  async getMessages(
    userId: string,
    req,
    cursor: string | null,
  ): Promise<IMessagesResponse> {
    const { userId: currentUserId } = req;

    const optionsForFindMessages: Includeable = {
      association: 'messages',
      attributes: ['id', 'content', 'createdAt'],
      limit: 10,
      order: [['createdAt', 'ASC']],
      include: [
        {
          association: 'author',
          attributes: ['avatar', 'id', 'userName'],
        },
      ],
    };

    if (cursor) {
      optionsForFindMessages.where = {
        createdAt: {
          [Op.gt]: new Date(+cursor),
        },
      };
    }

    const user = await this.userTable.findOne({
      where: {
        id: userId,
      },
      include: [
        {
          association: 'privateGroups',
          include: [
            {
              association: 'users',
            },
            optionsForFindMessages,
          ],
        },
      ],
    });

    const privateGroups = this.getGroupsByUser(user);

    const changedGroup = privateGroups.find((elem) =>
      elem.users.includes(currentUserId),
    );

    const lastElementTimestamp =
      changedGroup.messages[9]?.getDataValue('createdAt');
    const nextCursor = new Date(lastElementTimestamp).getTime();

    return {
      data: changedGroup.messages,
      pagination: {
        nextCursor: nextCursor ? `${nextCursor}` : null,
      },
    };
  }

  async updatePrivateMessage(
    data: UpdatePrivateMessage,
    req,
  ): Promise<IResponseMessage> {
    const { content, id } = data;

    const changedMessage = await this.messageTable.findOne({
      where: {
        id,
        authorId: req?.userId,
      },
    });

    if (!changedMessage) {
      throw new NotFoundException('Not Found');
    }

    changedMessage.update({
      content,
    });

    const groupId = changedMessage.getDataValue('groupId');

    const groupUser = await this.groupUserTable.findAll({
      where: {
        groupId,
      },
    });

    const userId = groupUser
      .map((elem) => elem.getDataValue('userId'))
      ?.find((id) => id !== req?.userId);

    const user = await this.userTable.findOne({
      where: {
        id: userId,
      },
      attributes: ['id', 'socketId', 'avatar', 'userName'],
    });

    const userData = user.get();

    this.wsService.server
      .in(userData.socketId)
      .emit(privateMessageEventTypes.UPDATE_PRIVATE_MESSAGE, {
        data: {
          user: {
            ...userData,
            socketId: undefined,
          },
          message: {
            id,
            content,
            createdAt: changedMessage.createdAt,
          },
        },
      });

    return {
      message: 'Message has updated',
    };
  }

  async deletePrivateMessage(
    messageId: string,
    req,
  ): Promise<IResponseMessage> {
    if (!messageId) {
      throw new BadRequestException('messageId is required');
    }

    const message = await this.messageTable.findOne({
      where: {
        id: messageId,
        authorId: req.userId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.destroy();

    const groupId = message.getDataValue('groupId');

    const groupUser = await this.groupUserTable.findAll({
      where: {
        groupId,
      },
    });

    const userId = groupUser
      .map((elem) => elem.getDataValue('userId'))
      ?.find((id) => id !== req?.userId);

    const user = await this.userTable.findOne({
      where: {
        id: userId,
      },
      attributes: ['id', 'socketId', 'avatar', 'userName'],
    });

    const userData = user.get();

    this.wsService.server
      .in(userData.socketId)
      .emit(privateMessageEventTypes.DELETE_PRIVATE_MESSAGE, {
        data: {
          user: {
            ...userData,
            socketId: undefined,
          },
          messageId,
        },
      });

    return {
      message: 'Message has deleted',
    };
  }
}

export default PrivateMessageService;
