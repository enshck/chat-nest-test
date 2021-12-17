import { Injectable, Body, Inject } from '@nestjs/common';

import createUserDto from 'dto/createUserDto';
import { IAuthResponse } from 'controllers/auth.controller';
import { dbTables } from 'const/dbTables';
import User from 'models/User';

@Injectable()
class AuthService {
  constructor(@Inject(dbTables.USER_TABLE) private userTable: typeof User) {}
  createUser(body: createUserDto): IAuthResponse {
    const { email, password, userName } = body;

    // this.userTable.

    return {
      token: '',
      userName: '',
      email: '',
    };
  }
}

export default AuthService;
