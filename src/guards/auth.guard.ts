import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import jwt = require('jsonwebtoken');

import variables from 'config/variables';
import User from 'models/User';
import { dbTables } from 'const/dbTables';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    @Inject(dbTables.USER_TABLE)
    private tokenTable: typeof User,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];

    try {
      jwt.verify(token, variables.jwtEncryptionKey);
    } catch (err) {
      throw new UnauthorizedException(err?.message ?? 'Invalid Token');
    }

    const existingToken = await this.tokenTable.findOne({
      where: {
        token,
      },
    });

    if (!existingToken) {
      throw new NotFoundException('User not found');
    }

    const idOfUser = existingToken.getDataValue('id');

    request.userId = idOfUser;

    return true;
  }
}

export default AuthGuard;
