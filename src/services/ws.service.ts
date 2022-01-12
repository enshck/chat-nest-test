import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import jwt = require('jsonwebtoken');

import { dbTables } from 'const/dbTables';
import User from 'models/User';
import UserGroup from 'models/UserGroup';
import variables from 'config/variables';

@WebSocketGateway()
export default class WsService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(dbTables.USER_TABLE) private userTable: typeof User,
    @Inject(dbTables.USER_GROUP_TABLE) private userGroupTable: typeof UserGroup,
  ) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  private async getUserId(client: Socket) {
    const token = client.handshake.headers.authorization;

    if (!token) {
      throw new WsException('Token is required');
    }

    try {
      jwt.verify(token, variables.jwtEncryptionKey);
    } catch (err) {
      return null;
    }

    const user = await this.userTable.findOne({
      where: {
        token: client.handshake.headers.authorization,
      },
    });

    if (!user) {
      return null;
    }

    return user.getDataValue('id');
  }

  private async attachSocketIdToUser(socketId: string | null, userId: string) {
    const currentUser = await this.userTable.findOne({
      where: {
        id: userId,
      },
    });

    currentUser.update({
      socketId,
    });
  }

  async handleDisconnect(client: Socket) {
    // remove user from ws groups for message groups

    const userId = await this.getUserId(client);
    await this.attachSocketIdToUser(null, userId);

    if (!userId) {
      return;
    }

    const results = await this.userGroupTable.findAll({
      where: {
        userId,
      },
    });
    const groupsIds = results.map((elem) => elem.getDataValue('groupId'));

    groupsIds.map((groupId) => client.leave(groupId));

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
    // add user to ws groups for message groups
    const userId = await this.getUserId(client);
    await this.attachSocketIdToUser(client.id, userId);

    if (!userId) {
      return;
    }

    const results = await this.userGroupTable.findAll({
      where: {
        userId,
      },
    });
    const groupsIds = results.map((elem) => elem.getDataValue('groupId'));

    client.join([...groupsIds]);
    this.logger.log(`Client connected: ${client.id}`);
  }
}
