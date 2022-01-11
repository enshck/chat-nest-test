import { Injectable, Inject } from '@nestjs/common';
import { Op, Includeable } from 'sequelize';

import { dbTables } from 'const/dbTables';
import PrivateMessage from 'models/PrivateMessage';
import PrivateGroup from 'models/PrivateGroup';
import PrivateGroupUser from 'models/PrivateGroupUser';
import { IResponseMessage } from 'interfaces/responseMessage';
import CreatePrivateMessage from 'dto/chat/createPrivateMessage.dto';
import User from 'models/User';
import { IMessagesResponse } from '../controllers/privateMessages.controller';

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

    await this.messageTable.create({
      content,
      authorId: senderUserId,
      groupId: existingGroupId,
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
}

export default PrivateMessageService;
