import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Model } from 'sequelize';
import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');

import createUserDto from 'dto/auth/createUser.dto';
import loginDto from 'dto/auth/login.dto';
import { IAuthResponse } from 'controllers/auth.controller';
import { dbTables } from 'const/dbTables';
import User from 'models/User';
import variables from 'config/variables';
import { IResponseMessage } from 'interfaces/responseMessage';

interface IGetUser {
  email?: string;
  id?: string;
}

@Injectable()
class AuthService {
  constructor(@Inject(dbTables.USER_TABLE) private userTable: typeof User) {}

  private async getUser(data: IGetUser): Promise<Model<User> | null> {
    const { email, id } = data;

    const where = {
      email,
      id,
    };

    const user = await this.userTable.findOne({
      where: JSON.parse(JSON.stringify(where)),
    });

    return user;
  }

  async createUser(body: createUserDto): Promise<IAuthResponse> {
    const { email, password, userName } = body;

    const existingUser = await this.getUser({
      email,
    });

    if (Boolean(existingUser)) {
      throw new BadRequestException('User already exist');
    }

    const hashOfPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email, userName }, variables.jwtEncryptionKey, {
      expiresIn: variables.jwtTokenExpired,
    });

    await this.userTable.create({
      email,
      userName,
      password: hashOfPassword,
      token,
    });

    return {
      token,
      userName,
      email,
    };
  }

  async login(body: loginDto): Promise<IAuthResponse> {
    const { email, password } = body;

    const existingUser = await this.getUser({
      email,
    });

    if (!Boolean(existingUser)) {
      throw new BadRequestException('User is not exist');
    }

    const existingUserData = existingUser.get();

    const isTruthPassword = await bcrypt.compare(
      password,
      existingUserData.password,
    );

    if (!isTruthPassword) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = jwt.sign(
      { email, userName: existingUserData.userName },
      variables.jwtEncryptionKey,
      {
        expiresIn: variables.jwtTokenExpired,
      },
    );

    await existingUser.update({
      token,
    });

    return {
      token,
      userName: existingUserData.userName,
      email,
    };
  }

  async logout(@Req() req): Promise<IResponseMessage> {
    const userId = req.userId;

    const existingUser = await this.getUser({
      id: userId,
    });

    if (!Boolean(existingUser)) {
      throw new BadRequestException('User is not exist');
    }

    await existingUser.update({
      token: null,
    });

    return {
      message: 'Successfull logout',
    };
  }
}

export default AuthService;
