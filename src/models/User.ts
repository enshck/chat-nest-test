import {
  Table,
  Column,
  Model,
  IsUUID,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import { ApiProperty } from '@nestjs/swagger';

import UserGroup from './UserGroup';
import Group from './Group';
import Message from './Message';
import PrivateGroup from './PrivateGroup';
import variables from 'config/variables';
import PrivateGroupUser from './PrivateGroupUser';
import PrivateMessage from './PrivateMessage';

@Table
export default class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column
  userName: string;

  @AllowNull
  @Column
  public get avatar(): string {
    let avatarFile = this.getDataValue('avatar');
    if (avatarFile) {
      avatarFile = `${variables.hostName}${variables.avatarDirectory}/${avatarFile}`;
    }
    return avatarFile;
  }

  @Column
  password: string;

  @AllowNull
  @Column
  token: string;

  @AllowNull
  @Column
  socketId: string;

  @HasMany(() => Group)
  createdGroups: Group[];

  @HasMany(() => Message)
  messages: Message[];

  @HasMany(() => PrivateMessage)
  privatMessages: PrivateMessage[];

  @BelongsToMany(() => Group, () => UserGroup)
  groups: Group[];

  @BelongsToMany(() => PrivateGroup, () => PrivateGroupUser)
  privateGroups: PrivateGroup[];
}
