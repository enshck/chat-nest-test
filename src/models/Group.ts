import {
  Table,
  Column,
  Model,
  IsUUID,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';

import User from './User';
import UserGroup from './UserGroup';
import Message from './Message';
import variables from 'config/variables';

@Table
export default class Group extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(UUIDV4)
  @Column
  id: string;

  @Column
  name: string;

  @AllowNull
  @Column
  description: string;

  @AllowNull
  @Column
  public get avatar(): string {
    let avatarFile = this.getDataValue('avatar');
    if (avatarFile) {
      avatarFile = `${variables.hostName}${variables.groupImagesDirectory}/${avatarFile}`;
    }
    return avatarFile;
  }

  @ForeignKey(() => User)
  @Column
  creatorId: string;

  @BelongsTo(() => User)
  creator: User;

  @BelongsToMany(() => User, () => UserGroup)
  users: User[];

  @HasMany(() => Message)
  messages: Message[];

  // @Column
  // public get lastMessage(): string {
  //   const messages = this.getDataValue('messages');
  //   return messages.slice(messages.length - 2, messages.length - 1)?.content;
  // }
}
