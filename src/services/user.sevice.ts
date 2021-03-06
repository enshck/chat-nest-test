import {
  Injectable,
  Inject,
  Req,
  NotFoundException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Model, Op } from 'sequelize';
import fs = require('fs');
import IResponseData from 'interfaces/responseData';

import { dbTables } from 'const/dbTables';
import User from 'models/User';
import updateUserDto from 'dto/user/updateUser.dto';
import getExtension from 'utils/getExtension';
import { IResponseMessage } from 'interfaces/responseMessage';
import { avatarExtensions } from 'validation/fileUpload';
import variables from 'config/variables';

@Injectable()
class UserService {
  constructor(@Inject(dbTables.USER_TABLE) private userTable: typeof User) {}

  async getUserData(@Req() req): Promise<Model<User> | null> {
    const user = await this.userTable.findOne({
      where: {
        id: req.userId,
      },
      attributes: ['id', 'email', 'userName', 'avatar'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userData = user.get();

    return userData;
  }

  async updateUserData(
    @Body() body: updateUserDto,
    @Req() req,
  ): Promise<Model<User> | null> {
    const user = await this.userTable.findOne({
      where: {
        id: req.userId,
      },
      attributes: ['email', 'userName', 'id'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const existingUserData = user.get();

    const { email } = body;

    if (email === existingUserData.email) {
      throw new BadRequestException('Change another email');
    }

    if (email) {
      const existUser = await this.userTable.findOne({
        where: {
          email,
        },
      });

      if (existUser) {
        throw new BadRequestException('User with this email already exist');
      }
    }

    await user.update(body);

    return user;
  }

  async updateAvatar(
    file: Express.Multer.File,
    req,
  ): Promise<IResponseMessage> {
    const userId = req?.userId;
    const extension = getExtension(file?.mimetype || '');

    if (!avatarExtensions.includes(extension)) {
      throw new BadRequestException(
        'Incorrect file format. Only jpg and png files',
      );
    }

    const currentUser = await this.userTable.findOne({
      where: {
        id: userId,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const fileName = `${userId}.${extension}`;

    fs.writeFile(
      `.${variables.staticDirectory}${variables.avatarDirectory}/${fileName}`,
      file.buffer,
      (err) => {
        console.log(err, 'group avatar save error');
      },
    );

    await currentUser.update({
      avatar: fileName,
    });

    return {
      message: 'File uploaded',
    };
  }

  async searchUsers(req, search: string): Promise<IResponseData<User[]>> {
    if (!search.length) {
      throw new BadRequestException('Search is required');
    }

    const results = await this.userTable.findAll({
      where: {
        userName: {
          [Op.iLike]: `%${search}%`,
        },
        id: {
          [Op.not]: req.userId,
        },
      },
      attributes: ['id', 'userName', 'avatar'],
    });

    return {
      data: results,
    };
  }
}

export default UserService;
