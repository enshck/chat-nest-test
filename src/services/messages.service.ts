import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Op, FindOptions } from 'sequelize';

import { dbTables } from 'const/dbTables';
import Message from 'models/Message';
import UserGroup from 'models/UserGroup';
import { IMessagesResponse } from 'controllers/messages.controller';
import { IResponseMessage } from 'interfaces/responseMessage';
import CreateMessage from 'dto/chat/createMessage.dto';
import UpdateMessage from 'dto/chat/updateMessage.dto';
import WsService from 'services/ws.service';
import { messageEventTypes } from 'const/wsTypes';

@Injectable()
class MessageService {
  constructor(
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
    @Inject(dbTables.MESSAGE_TABLE) private messageTable: typeof Message,
    private readonly wsService: WsService,
  ) {}

  async getMessagesForGroup(
    req,
    groupId: string,
    cursor: string | null,
  ): Promise<IMessagesResponse> {
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

    const optionsForFindMessages: FindOptions = {
      where: {
        groupId,
      },
      attributes: ['id', 'content', 'createdAt'],
      include: [
        {
          association: 'author',
          attributes: ['id', 'email', 'userName', 'avatar'],
        },
      ],
      limit: 10,
      order: [['createdAt', 'ASC']],
    };

    if (cursor) {
      optionsForFindMessages.where['createdAt'] = {
        [Op.gt]: new Date(+cursor),
      };
    }

    const messages = await this.messageTable.findAll({
      ...optionsForFindMessages,
    });

    const lastElementTimestamp = messages[9]?.getDataValue('createdAt');
    const nextCursor = new Date(lastElementTimestamp).getTime();

    return {
      data: messages,
      pagination: {
        nextCursor: nextCursor ? `${nextCursor}` : null,
      },
    };
  }

  async createMessage(
    userId: string,
    data: CreateMessage,
  ): Promise<IResponseMessage> {
    const { groupId } = data;

    const group = await this.userGroupTable.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (!group) {
      throw new UnauthorizedException("You're not in group");
    }

    const result = await this.messageTable.create({
      ...data,
      authorId: userId,
    });

    const createdMessage = await this.messageTable.findOne({
      where: {
        id: result.id,
      },
      attributes: ['id', 'content', 'groupId'],
      include: [
        {
          association: 'author',
          attributes: ['id', 'email', 'userName', 'avatar'],
        },
      ],
    });

    this.wsService.server.to(data.groupId).emit(messageEventTypes.NEW_MESSAGE, {
      data: createdMessage,
    });

    return {
      message: 'Message has created',
    };
  }

  async updateMessage(
    userId: string,
    data: UpdateMessage,
  ): Promise<IResponseMessage> {
    const { messageId, content } = data;

    const message = await this.messageTable.findOne({
      where: {
        id: messageId,
        authorId: userId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.update({
      content,
    });

    const updatedMessage = await this.messageTable.findOne({
      where: {
        id: messageId,
      },
      attributes: ['id', 'content', 'groupId'],
      include: [
        {
          association: 'author',
          attributes: ['id', 'email', 'userName', 'avatar'],
        },
      ],
    });

    this.wsService.server
      .to(updatedMessage.getDataValue('groupId'))
      .emit(messageEventTypes.UPDATE_MESSAGE, {
        data: updatedMessage,
      });

    return {
      message: 'Message has updated',
    };
  }

  async deleteMessage(
    userId: string,
    messageId: string,
  ): Promise<IResponseMessage> {
    const message = await this.messageTable.findOne({
      where: {
        authorId: userId,
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await message.destroy();

    const groupId = message.getDataValue('groupId');

    this.wsService.server.to(groupId).emit(messageEventTypes.DELETE_MESSAGE, {
      messageId,
      groupId,
    });

    return {
      message: 'Message has deleted',
    };
  }
}

export default MessageService;
