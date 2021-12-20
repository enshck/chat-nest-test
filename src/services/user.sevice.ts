import {
  Injectable,
  Inject,
  Req,
  NotFoundException,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Model } from 'sequelize';

import { dbTables } from 'const/dbTables';
import User from 'models/User';
import updateUserDto from 'dto/user/updateUser.dto';

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

    return user;
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
}

export default UserService;
