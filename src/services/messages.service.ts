import { Injectable, Inject, BadRequestException } from '@nestjs/common';

import { dbTables } from 'const/dbTables';
import Message from 'models/Message';
import UserGroup from 'models/UserGroup';
import { IMessagesResponse } from 'controllers/messages.controller';
import { IResponseMessage } from 'interfaces/responseMessage';
import CreateMessage from 'dto/chat/createMessage.dto';

@Injectable()
class MessageService {
  constructor(
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
    @Inject(dbTables.MESSAGE_TABLE) private messageTable: typeof Message,
  ) {}

  async getMessagesForGroup(req, groupId: string): Promise<IMessagesResponse> {
    const { userId } = req;

    const result = this.userGroupTable.findAll({
      where: {
        groupId,
        userId,
      },
    });

    if (!result) {
      throw new BadRequestException("You're not in group");
    }

    const messages = await this.messageTable.findAll({
      where: {
        groupId,
      },
      attributes: ['id', 'content'],
      include: [
        {
          association: 'author',
          attributes: ['id', 'email', 'userName', 'avatar'],
        },
      ],
    });

    return {
      data: messages,
    };
  }

  async createMessage(
    userId: string,
    data: CreateMessage,
  ): Promise<IResponseMessage> {
    await this.messageTable.create({
      ...data,
      authorId: userId,
    });

    return {
      message: 'Message created',
    };
  }
}

export default MessageService;
